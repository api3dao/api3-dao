//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./auxiliary/interfaces/IApi3Token.sol";
import "./auxiliary/SafeMath.sol";
import "hardhat/console.sol";

contract StateUtils {
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

    struct UserUpdate {
        uint256 epoch;
        uint256 atBlock;
        uint256 claimIndex;
    }

    struct User {
        uint256 unstaked;
        Checkpoint[] shares;
        uint256 locked;
        uint256 unstakeScheduledAt;
        uint256 unstakeAmount;
        mapping(uint256 => bool) revokedEpochReward;
        UserUpdate lastUpdate;
    }

    IApi3Token internal api3Token;

    //1 week in blocks @ 14sec/block
    uint256 public constant rewardEpochLength = 43200;
    //1 year in epochs
    uint256 public constant rewardVestingPeriod = 52;
    uint256 public immutable genesisEpoch;

    mapping(address => User) public users;

    Checkpoint[] public totalShares; // Always up to date
    Checkpoint[] public totalStaked; // Always up to date

    mapping(uint256 => RewardEpoch) public rewards;
    Checkpoint[] public claimLocks;

    uint256 public lastUpdateBlock;

    // uint256 internal onePercent = 1000000;
    // uint256 internal hundredPercent = 100000000;
    // VVV These parameters will be governable by the DAO VVV
    // Percentages are multipl1ied by 1,000,000.
    uint256 public minApr = 2500000; // 2.5%
    uint256 public maxApr = 75000000; // 75%
    uint256 public stakeTarget = 10e6 ether; // 10M API3
    // updateCoeff is not in percentages, it's a coefficient that determines
    // how aggresively inflation rate will be updated to meet the target.
    uint256 public updateCoeff = 1000000;
    uint256 public unstakeWaitPeriod = 172800; //4 weeks in blocks @ 14sec/block
    // ^^^ These parameters will be governable by the DAO ^^^

    uint256 public currentApr = minApr;
    
    constructor(address api3TokenAddress)
        public
    {
        // Initialize the share price at 1 API3
        totalShares.push(Checkpoint(block.number, 1));
        totalStaked.push(Checkpoint(block.number, 1));
        api3Token = IApi3Token(api3TokenAddress);
        genesisEpoch = now / rewardEpochLength;
    }

    function updateCurrentApr()
        internal
    {
        uint256 totalStakedNow = getValue(totalStaked);
        if (stakeTarget < totalStakedNow) {
            currentApr = minApr;
            return;
        }

        uint256 deltaAbsolute = totalStakedNow < stakeTarget
            ? stakeTarget.sub(totalStakedNow) : totalStakedNow.sub(stakeTarget);
        uint256 deltaPercentage = deltaAbsolute.mul(hundredPercent).div(stakeTarget);
        
        // An updateCoeff of 1,000,000 means that for each 1% deviation from the 
        // stake target, APR will be updated by 1%.
        uint256 aprUpdate = deltaPercentage.mul(updateCoeff).div(onePercent);
        // console.log('CONTRACT_APR_UPDATE');
        // console.log(aprUpdate);

        currentApr = currentApr.mul(aprUpdate.add(hundredPercent)).div(hundredPercent);
        // console.log('CONTRACT_BELOW_TARGET');
        // console.log(totalStakedNow < stakeTarget);
        // console.log('CONTRACT_APR_CALC');
        // console.log(currentApr);
        
        if (currentApr > maxApr)
        {
            currentApr = maxApr;
        }
        // console.log('CONTRACT_NEW_APR');
        // console.log(currentApr);
    }

    function payReward()
        internal
    {
        updateCurrentApr();
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 rewardAmount = totalStakedNow * currentApr / 52 / 100000000;
        uint256 indEpoch = now / rewardEpochLength;
        rewards[indEpoch] = RewardEpoch(true, rewardAmount, block.number);
        //Cover the case when multiple epochs have passed without change in totalStaked
        //We have to add each epoch to the mapping rather than just total the rewards because
        //rewardVestingPeriod is denominated in epochs.
        while (!rewards[indEpoch - 1].paid) {
            rewards[indEpoch - 1] = RewardEpoch(true, rewardAmount, block.number);
            indEpoch--;
        }
        if (!api3Token.getMinterStatus(address(this))) {
            return;
        }
        if (rewardAmount == 0) {
            return;
        }
        totalStaked.push(Checkpoint(block.number, totalStakedNow + rewardAmount));
        api3Token.mint(address(this), rewardAmount);
    }

    function updateUserLock(address userAddress, uint256 targetEpoch)
        public
    {
        //Effectively this condition only obtains when we're targeting the current epoch.
        if (!rewards[targetEpoch].paid) {
            payReward();
        }

        //Reward intervals are sufficiently deterministic for us to access a mapping by epochs instead of iterating over
        //checkpoints. We start totaling locked rewards from epoch T-52 (floor +0) and unlocked rewards from epoch +52.
        uint256 currentEpoch = now / rewardEpochLength;
        uint256 firstUnlockEpoch = genesisEpoch + rewardVestingPeriod;
        uint256 oldestLockedEpoch = currentEpoch >= firstUnlockEpoch ?
                                    currentEpoch - rewardVestingPeriod : genesisEpoch;

        //Governance updates of unstakeWaitingPeriod are prohibited from exceeding rewardVestingPeriod,
        //so in the extreme future case where we could be targeting an epoch more than rewardVestingPeriod
        //before present, we can just set locked to 0. We prevent exploitation of this elsewhere by explicitly
        //requiring that User is caught up to lastUpdateBlock in order to execute a withdrawal.
        uint256 locked = 0;
        if (targetEpoch > oldestLockedEpoch) {
            uint256 targetBlock = targetEpoch == currentEpoch ? 
                                                 block.number : rewards[targetEpoch].atBlock;
            uint256 updateBlock = targetBlock - 1;
            User storage user = users[userAddress];
            locked = user.locked;
            UserUpdate lastUpdate = user.lastUpdate;

            //Claim locks represent the value of currently undecided claims, which remain pending no longer than unstakeWaitPeriod,
            //so we only care about claim locks from the last unstakeWaitPeriod blocks, and if we're doing a partial update
            //we can safely ignore them.
            uint256 currentClaimWindow = block.number - unstakeWaitPeriod;
            if (
                claimLocks.length > 0 
                && claimLocks[claimLocks.length - 1].fromBlock >= currentClaimWindow
                && updateBlock >= currentClaimWindow
            ) {
                //getIndexOf finds the latest state at or before the block argument, so we cover both cases.
                uint256 oldestValidClaimIndex = getIndexOf(claimLocks, currentClaimWindow);
                if (claimLocks[oldestValidClaimIndex].fromBlock != currentClaimWindow) {
                    oldestValidClaimIndex++;
                }
                //We avoid iterating over storage as much as possible, so User stores the index of the last claim it updated on 
                //to initialize our loop.
                for (
                    uint256 ind = lastUpdate.claimIndex < oldestValidClaimIndex ? 
                                  oldestValidClaimIndex : lastUpdate.claimIndex + 1;
                    ind < claimLocks.length && claimLocks[ind].fromBlock < updateBlock;
                    ind++
                ) {
                //When a claim is decided, that lock is zeroed because those tokens were either spent or unfrozen.
                    if (claimLocks[ind].value > 0) {
                        Checkpoint storage lock = claimLocks[ind];
                        uint256 totalSharesAtBlock = getValueAt(totalShares, lock.fromBlock);
                        uint256 userSharesAtBlock = getValueAt(user.shares, lock.fromBlock);
                        locked += lock.value * userSharesAtBlock / totalSharesAtBlock;
                    }
                }
            }

            if (rewards[genesisEpoch].paid) {
                uint256 lastUpdateEpoch = lastUpdate.epoch;
                for (
                    uint256 ind = lastUpdate.epoch < oldestLockedEpoch ? oldestLockedEpoch : lastUpdate.epoch + 1;
                    ind <= currentEpoch;
                    ind++
                ) {
                    uint256 storage lockedReward = rewards[ind];
                    uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
                    uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
                    locked += lockedReward.amount * userSharesThen / totalSharesThen;
                }
                if (currentEpoch >= firstUnlockEpoch) {
                    for (
                        uint256 ind = user.lastUpdateEpoch < firstUnlockEpoch ? firstUnlockEpoch : user.lastUpdateEpoch + 1;
                        ind <= currentEpoch;
                        ind++
                    ) {
                        uint256 storage unlockedReward = rewards[ind - rewardVestingPeriod];
                        uint256 totalSharesThen = getValueAt(totalShares, unlockedReward.atBlock);
                        uint256 userSharesThen = getValueAt(user.shares, unlockedReward.atBlock);
                        locked -= unlockedReward.amount * userSharesThen / totalSharesThen;
                    }        
                }
            }
        }

        user.locked = locked;
        //We only set the global lastUpdateBlock and user lastUpdate.claimIndex atomically,
        //ie. when fast-forwarding User all the way to present.
        uint256 claimIndexAtUpdate = 0;
        if (updateBlock == block.number - 1) {
            lastUpdateBlock = updateBlock;
            claimIndexAtUpdate = claimLocks.length - 1;
        }
        user.lastUpdate = UserUpdate(targetEpoch, updateBlock, claimIndexAtUpdate);
    }

    // From https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    function getValueAt(Checkpoint[] storage checkpoints, uint _block) view internal returns (uint) {
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints[checkpoints.length-1].value;
        if (_block < checkpoints[0].fromBlock)
            return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
    }

    function getValue(Checkpoint[] storage checkpoints)
    internal view returns (uint256) {
        return getValueAt(checkpoints, block.number);
    }

    // Extracted from `getValueAt()`
    function getIndexOf(Checkpoint[] storage checkpoints, uint _block) view internal returns (uint) {
        // Repeating the shortcut
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints.length-1;
        
        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return min;
    }
}
