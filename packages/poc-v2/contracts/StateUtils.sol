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
    }

    IApi3Token internal api3Token;

    //1 week in blocks @ 14sec/block
    uint256 public constant rewardEpochLength = 43200;
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
    uint256 public unstakeWaitPeriod = 604800; //1 week in seconds
    // ^^^ These parameters will be governable by the DAO ^^^

    uint256 public currentApr = minApr;

    uint256 internal constant onePercent = 1000000;
    uint256 internal constant hundredPercent = 100000000;

    event Epoch(uint256 indexed epoch, uint256 rewardAmount, uint256 newApr);

    modifier triggerEpochBefore {
        if (!rewards[now.div(rewardEpochLength)].paid) {
            payReward();
        }
        _;
    }

    modifier triggerEpochAfter {
        _;
        if (!rewards[now.div(rewardEpochLength)].paid) {
            payReward();
        }
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

        uint256 newApr = totalStakedNow < stakeTarget
            ? currentApr.mul(hundredPercent.add(aprUpdate)).div(hundredPercent) 
            : currentApr.mul(hundredPercent.sub(aprUpdate)).div(hundredPercent);
        
        if (currentApr < minApr) {
            currentApr = minApr;
        }
        else if (currentApr > maxApr) {
            currentApr = maxApr;
        } else {
            currentApr = newApr;
        }
    }

    function payReward()
        internal
    {
        updateCurrentApr();
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 rewardAmount = totalStakedNow.mul(currentApr).div(52).div(100000000);
        uint256 indEpoch = now.div(rewardEpochLength);
        rewards[indEpoch] = RewardEpoch(true, rewardAmount, block.number);
        emit Epoch(indEpoch, rewardAmount, currentApr);
        while (!rewards[indEpoch.sub(1)].paid && indEpoch.sub(1) >= genesisEpoch) {
            rewards[indEpoch.sub(1)] = RewardEpoch(true, rewardAmount, block.number);
            emit Epoch(indEpoch, rewardAmount, currentApr);
            indEpoch = indEpoch.sub(1);
        }
        if (!api3Token.getMinterStatus(address(this))) {
            return;
        }
        if (rewardAmount == 0) {
            return;
        }
        totalStaked.push(Checkpoint(block.number, totalStakedNow.add(rewardAmount)));
        api3Token.mint(address(this), rewardAmount);
    }

    function updateUserLock(address userAddress, uint256 targetEpoch)
        public triggerEpochBefore
    {
        uint256 newLocked = this.getCurrentUserLock(userAddress, targetEpoch);
        users[userAddress].locked = newLocked;
        users[userAddress].lastUpdateEpoch = targetEpoch;
    }

    function getCurrentUserLock(address userAddress, uint256 targetEpoch)
        external view returns(uint256)
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        uint256 firstUnlockEpoch = genesisEpoch.add(rewardVestingPeriod);
        uint256 oldestLockedEpoch = currentEpoch >= firstUnlockEpoch ?
                                    currentEpoch.sub(rewardVestingPeriod) : genesisEpoch;

        User storage user = users[userAddress];
        uint256 lastUpdateEpoch = user.lastUpdateEpoch;
        uint256 locked = user.locked;
        for (
            uint256 ind = user.lastUpdateEpoch < oldestLockedEpoch ? oldestLockedEpoch : user.lastUpdateEpoch.add(1);
            ind <= currentEpoch;
            ind = ind.add(1)
        ) {
            RewardEpoch storage lockedReward = rewards[ind];
            uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
            uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
            locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
        }
        if (currentEpoch >= firstUnlockEpoch) {
            for (
                uint256 ind = user.lastUpdateEpoch < firstUnlockEpoch ? firstUnlockEpoch : user.lastUpdateEpoch.add(1);
                ind <= currentEpoch;
                ind = ind.add(1)
            ) {
                RewardEpoch storage unlockedReward = rewards[ind.sub(rewardVestingPeriod)];
                uint256 totalSharesThen = getValueAt(totalShares, unlockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, unlockedReward.atBlock);
                locked = locked.sub(unlockedReward.amount.mul(userSharesThen).div(totalSharesThen));
            }
        }
        return locked;
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

    function getIndexOf(Checkpoint[] storage checkpoints, uint _block) 
    internal view returns (uint) {
        // Repeating the shortcut
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints.length-1;
        
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
        return min;
    }
}
