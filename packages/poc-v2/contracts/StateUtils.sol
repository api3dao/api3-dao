//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./auxiliary/interfaces/IApi3Token.sol";
import "./auxiliary/SafeMath.sol";
import "hardhat/console.sol";

contract StateUtils {
    using SafeMath for uint256;
    struct Checkpoint
    {
        uint256 fromBlock;
        uint256 value;
    }

    struct RewardEpoch {
        bool paid;
        uint256 amount;
        uint256 atBlock;
    }

    struct User {
        uint256 unstaked;
        Checkpoint[] shares;
        uint256 locked;
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

    // VVV These parameters will be governable by the DAO VVV
    // Percentages are multipl1ied by 1,000,000.
    uint256 public minApr = 2500000; // 2.5%
    uint256 public maxApr = 75000000; // 75%
    uint256 public stakeTarget = 10e6 ether;
    uint256 public updateCoeff = 1000000;
    uint256 public unstakeWaitPeriod = rewardEpochLength;
    // ^^^ These parameters will be governable by the DAO ^^^

    uint256 public currentApr = minApr;

    mapping(address => mapping(uint256 => string)) public proposalSpecUrls;

    uint256 internal constant onePercent = 1000000;
    uint256 internal constant hundredPercent = 100000000;

    event Epoch(uint256 indexed epoch, uint256 rewardAmount, uint256 newApr);

    modifier triggerEpochBefore {
        payReward();
        _;
    }

    modifier triggerEpochAfter {
        _;
        payReward();
    }
    
    constructor(address api3TokenAddress)
        public
    {
        totalShares.push(Checkpoint(block.number, 1));
        totalStaked.push(Checkpoint(block.number, 1));
        api3Token = IApi3Token(api3TokenAddress);
        genesisEpoch = now.div(rewardEpochLength);
    }

    function updateCurrentApr()
        internal
    {
        if (stakeTarget == 0) {
            currentApr = minApr;
            return;
        }
        uint256 totalStakedNow = getValue(totalStaked);

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

        uint256 newApr = totalStakedNow < stakeTarget
            ? currentApr.mul(hundredPercent.add(aprUpdate)).div(hundredPercent) 
            : currentApr.mul(hundredPercent.sub(aprUpdate)).div(hundredPercent);
        
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

    function payReward()
        public
    {
        uint256 indEpoch = now.div(rewardEpochLength);
        if (!rewards[indEpoch].paid) {
            updateCurrentApr();
            uint256 totalStakedNow = getValue(totalStaked);
            uint256 rewardAmount = totalStakedNow.mul(currentApr).div(rewardVestingPeriod).div(hundredPercent);
            uint256 indEpoch = now.div(rewardEpochLength);
            if (!api3Token.getMinterStatus(address(this))) {
                rewards[indEpoch] = RewardEpoch(true, 0, block.number);
                emit Epoch(indEpoch, 0, currentApr);
                return;
            }
            uint epochsElapsed = 1;
            while (!rewards[indEpoch].paid) {
                rewards[indEpoch] = RewardEpoch(true, rewardAmount, block.number);
                if (rewardAmount > 0) {
                    api3Token.mint(address(this), rewardAmount);
                }
                emit Epoch(indEpoch, rewardAmount, currentApr);
                indEpoch = indEpoch.sub(1);
                epochsElapsed = epochsElapsed.add(1);
            }
            if (rewardAmount > 0) {
                totalStaked.push(Checkpoint(block.number, totalStakedNow.add(rewardAmount.mul(epochsElapsed))));
            }
        }
    }

    //Even though this function is intended to address the case in which payReward() runs out of gas, we still trigger payReward()
    //at the beginning to prevent this function being called on the epoch one behind present while the present epoch is unpaid, as this would
    //cause it to be filled with an incorrect zero value.
    function payRewardAtEpoch(uint256 epoch)
    external triggerEpochBefore {
        require(epoch >= genesisEpoch && epoch < now.div(rewardEpochLength), "Invalid target");
        require(api3Token.getMinterStatus(address(this)), "Minting to this contract is currently disabled");
        uint256 indEpoch = epoch;
        while (!rewards[indEpoch].paid) {
            if (rewards[indEpoch.add(1)].paid) {
                RewardEpoch storage nextPaidEpoch = rewards[indEpoch.add(1)];
                rewards[epoch] = RewardEpoch(
                    true,
                    nextPaidEpoch.amount,
                    //We set atBlock to what it would have been if all missed epochs had been paid at once because user shares are checkpointed by block
                    nextPaidEpoch.atBlock
                );
                if (nextPaidEpoch.amount > 0) {
                    uint256 totalStakedNow = getValue(totalStaked);
                    totalStaked.push(Checkpoint(nextPaidEpoch.atBlock, totalStakedNow.add(nextPaidEpoch.amount)));
                    api3Token.mint(address(this), nextPaidEpoch.amount);
                }
                emit Epoch(indEpoch.add(1), nextPaidEpoch.amount, nextPaidEpoch.atBlock);
                return;
            }
            indEpoch = indEpoch.add(1);
        }
    }

    function updateUserLocked(address userAddress, uint256 targetEpoch)
        public triggerEpochBefore
    {
        uint256 newLocked = getUserLocked(userAddress, targetEpoch);
        uint256 oldestLockedEpoch = getOldestLockedEpoch();
        uint256 nextLockedEpoch = getUserNextLockedEpoch(userAddress);
        User storage user = users[userAddress];
        user.oldestLockedEpoch = targetEpoch < oldestLockedEpoch ?
                                  targetEpoch : nextLockedEpoch;
        user.lastUpdateEpoch = targetEpoch;
        user.locked = newLocked;
    }

    function getUserLocked(address userAddress, uint256 targetEpoch)
        public view returns(uint256)
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        User storage user = users[userAddress];
        uint256 lastUpdateEpoch = user.lastUpdateEpoch;

        require(targetEpoch <= currentEpoch && targetEpoch >= lastUpdateEpoch, "Invalid target");
        if (targetEpoch == lastUpdateEpoch) {
            return;
        }

        uint256 firstUnlockEpoch = genesisEpoch.add(rewardVestingPeriod);
        uint256 oldestLockedEpoch = getOldestLockedEpoch();

        uint256 locked = user.locked;
        uint256 nextLockedEpoch = getUserNextLockedEpoch(userAddress);
        for (
            uint256 ind = nextLockedEpoch;
            ind <= targetEpoch;
            ind = ind.add(1)
        ) {
            RewardEpoch storage lockedReward = rewards[ind];
            uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
            uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
            locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
        }
        if (targetEpoch >= firstUnlockEpoch && user.oldestLockedEpoch < oldestLockedEpoch) {
            for (
                uint256 ind = user.oldestLockedEpoch;
                ind <= lastUpdateEpoch;
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

    function getOldestLockedEpoch()
    internal view returns(uint256) {
        uint256 currentEpoch = now.div(rewardEpochLength);
        return currentEpoch >= firstUnlockEpoch ?
                currentEpoch.sub(rewardVestingPeriod) : genesisEpoch;
    }

    function getUserNextLockedEpoch(address userAddress)
    internal view returns(uint256) {
        User storage user = users[userAddress];
        return user.lastUpdateEpoch < oldestLockedEpoch ? 
                    oldestLockedEpoch : user.lastUpdateEpoch.add(1);
    }

    // From https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    function getValueAt(Checkpoint[] storage checkpoints, uint _block)
    internal view returns (uint) {
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
    internal view returns (uint256) {
        return getValueAt(checkpoints, block.number);
    }
}
