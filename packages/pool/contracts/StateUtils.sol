//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./auxiliary/interfaces/IApi3Token.sol";
import "./auxiliary/SafeMath.sol";
import "hardhat/console.sol";

contract StateUtils {
    using SafeMath for uint256;
    struct Checkpoint {
        uint256 fromBlock;
        uint256 value;
    }

    struct RewardEpoch {
        uint256 amount;
        uint256 atBlock;
    }

    struct Delegation {
        uint256 fromBlock;
        address delegate;
    }

    struct User {
        uint256 unstaked;
        Checkpoint[] shares;
        uint256 locked;
        uint256 vesting;
        Delegation[] delegates;
        Checkpoint[] delegatedTo;
        uint256 unstakeScheduledFor;
        uint256 unstakeAmount;
        mapping(uint256 => bool) revokedEpochReward;
        uint256 lastUpdateEpoch;
        uint256 oldestLockedEpoch;
    }

    IApi3Token internal api3Token;

    //1 week in seconds
    uint256 public constant rewardEpochLength = 604800;
    //1 year in epochs
    uint256 public constant rewardVestingPeriod = 52;
    uint256 public immutable genesisEpoch;

    mapping(address => User) public users;
    
    Checkpoint[] public totalShares;
    Checkpoint[] public totalStaked;

    mapping(uint256 => RewardEpoch) public rewards;
    uint256 public lastEpochPaid;

    uint256 public minApr = 2500000;
    uint256 public maxApr = 75000000;
    uint256 public stakeTarget = 10e6 ether;
    uint256 public updateCoeff = 1000000;
    uint256 public unstakeWaitPeriod = rewardEpochLength;

    uint256 public currentApr = minApr;

    address public claimsManager;

    uint256 internal constant onePercent = 1000000;
    uint256 internal constant hundredPercent = 100000000;

    event Epoch(uint256 indexed epoch, uint256 rewardAmount, uint256 newApr);
    event UserUpdate(address indexed user, uint256 toEpoch, uint256 locked);

    modifier triggerEpochBefore {
        uint256 targetEpoch = getRewardTargetEpoch();
        payReward(targetEpoch);
        _;
    }

    modifier triggerEpochAfter {
        _;
        uint256 targetEpoch = getRewardTargetEpoch();
        payReward(targetEpoch);
    }

    modifier onlyClaimsManager(address caller) {
        require(caller == claimsManager, "Unauthorized");
        _;
    }

    // modifier onlyDao(address caller) {
    //     require(caller == address(daoAgent));
    //     _;
    // }
    
    constructor(address api3TokenAddress)
        public
    {
        totalShares.push(Checkpoint(block.number, 1));
        totalStaked.push(Checkpoint(block.number, 1));
        api3Token = IApi3Token(api3TokenAddress);
        genesisEpoch = now.div(rewardEpochLength);
        lastEpochPaid = now.div(rewardEpochLength);
        rewards[now.div(rewardEpochLength)] = RewardEpoch(0, block.number);
    }

    function updateCurrentApr(uint256 totalStakedNow)
        internal
    {
        if (stakeTarget == 0) {
            currentApr = minApr;
            return;
        }

        uint256 deltaAbsolute = totalStakedNow < stakeTarget 
            ? stakeTarget.sub(totalStakedNow) : totalStakedNow.sub(stakeTarget);
        uint256 deltaPercentage = deltaAbsolute.mul(hundredPercent).div(stakeTarget);
        
        uint256 aprUpdate = deltaPercentage.mul(updateCoeff).div(onePercent);

        uint256 newApr;
        if (totalStakedNow < stakeTarget) {
            newApr = currentApr.mul(hundredPercent.add(aprUpdate)).div(hundredPercent);
        }
        else {
            newApr = hundredPercent > aprUpdate
                ? currentApr.mul(hundredPercent.sub(aprUpdate)).div(hundredPercent)
                : 0;
        }

        if (newApr < minApr) {
            currentApr = minApr;
        }
        else if (newApr > maxApr) {
            currentApr = maxApr;
        }
        else {
            currentApr = newApr;
        }
    }

    function payReward(uint256 targetEpoch)
        public
    {
        require(targetEpoch <= now.div(rewardEpochLength));
        
        if (lastEpochPaid < targetEpoch) {
            uint256 epochToPay = lastEpochPaid.add(1);
            uint256 totalStakedNow = getValue(totalStaked);

            bool minted = false;
            while (epochToPay <= targetEpoch) {
                if (!api3Token.getMinterStatus(address(this))) {
                    rewards[epochToPay] = RewardEpoch(0, block.number);
                    emit Epoch(epochToPay, 0, currentApr);
                } else {
                    updateCurrentApr(totalStakedNow);
                    uint256 rewardAmount = totalStakedNow.mul(currentApr).div(rewardVestingPeriod).div(hundredPercent);
                    rewards[epochToPay] = RewardEpoch(rewardAmount, block.number);

                    if (rewardAmount > 0) {
                        api3Token.mint(address(this), rewardAmount);
                        totalStakedNow = totalStakedNow.add(rewardAmount);
                        minted = true;
                    }
                    emit Epoch(epochToPay, rewardAmount, currentApr);
                }
                epochToPay = epochToPay.add(1);
            }

            lastEpochPaid = targetEpoch;
            if (minted) {
                totalStaked.push(Checkpoint(block.number, totalStakedNow));
            }
        }
    }

    function updateUserLocked(address userAddress, uint256 targetEpoch)
        public
    {
        uint256 newLocked = getUserLockedAt(userAddress, targetEpoch);

        User storage user = users[userAddress];
        user.locked = newLocked;
        user.oldestLockedEpoch = getOldestLockedEpoch();
        user.lastUpdateEpoch = targetEpoch;

        emit UserUpdate(userAddress, targetEpoch, user.locked);
    }

    function getUserLockedAt(address userAddress, uint256 targetEpoch)
        public triggerEpochBefore returns(uint256)
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        uint256 oldestLockedEpoch = getOldestLockedEpoch();

        User storage user = users[userAddress];
        uint256 lastUpdateEpoch = user.lastUpdateEpoch;

        require(targetEpoch <= currentEpoch
                && targetEpoch > lastUpdateEpoch
                && targetEpoch > oldestLockedEpoch,
                "Invalid target");

        if (lastUpdateEpoch < oldestLockedEpoch) {
            uint256 locked = 0;
            for (
                uint256 ind = oldestLockedEpoch;
                ind <= targetEpoch;
                ind = ind.add(1)
            ) {
                RewardEpoch storage lockedReward = rewards[ind];
                uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
                locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
            }
            return locked;
        }

        uint256 locked = user.locked;
        for (
            uint256 ind = lastUpdateEpoch.add(1);
            ind <= targetEpoch;
            ind = ind.add(1)
        ) {
            RewardEpoch storage lockedReward = rewards[ind];
            uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
            uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
            locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
        }

        if (targetEpoch >= genesisEpoch.add(rewardVestingPeriod)) {
            for (
                uint256 ind = user.oldestLockedEpoch;
                ind <= oldestLockedEpoch.sub(1);
                ind = ind.add(1)
            ) {
                RewardEpoch storage unlockedReward = rewards[ind.sub(rewardVestingPeriod)];
                uint256 totalSharesThen = getValueAt(totalShares, unlockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, unlockedReward.atBlock);
                uint256 toUnlock = unlockedReward.amount.mul(userSharesThen).div(totalSharesThen);
                locked = locked > toUnlock ? locked.sub(toUnlock) : 0;
            }
        }

        return locked;
    }

    function getUserLocked(address userAddress)
        external returns(uint256)
    {
        return getUserLockedAt(userAddress, now.div(rewardEpochLength));
    }

    function getOldestLockedEpoch()
        internal view returns(uint256)
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        return currentEpoch >= genesisEpoch.add(rewardVestingPeriod) ?
                currentEpoch.sub(rewardVestingPeriod) : genesisEpoch;
    }

    //Cutting off the payReward loop at 5 and setting the intermediate target to depth / 2
    function getRewardTargetEpoch()
        internal view returns(uint256)
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        uint256 unpaidEpochs = currentEpoch.sub(lastEpochPaid);
        return unpaidEpochs <= 5 ? currentEpoch : lastEpochPaid.add(unpaidEpochs.div(2));
    }

    // From https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    function getValueAt(Checkpoint[] storage checkpoints, uint _block)
        internal view returns (uint)
    {
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock)
            return checkpoints[checkpoints.length.sub(1)].value;
        if (_block < checkpoints[0].fromBlock)
            return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length.sub(1);
        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }
        return checkpoints[min].value;
    }

    function getValue(Checkpoint[] storage checkpoints)
        internal view returns (uint256)
    {
        return getValueAt(checkpoints, block.number);
    }


}
