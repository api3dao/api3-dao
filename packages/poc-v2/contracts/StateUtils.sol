//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

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
        uint256 unstakeScheduledAt;
        uint256 unstakeAmount;
        mapping(uint256 => bool) revokedEpochReward;
        uint256 lastUpdateBlock;
        uint256 lastUpdateEpoch;
        uint256 lastUpdateClaimIndex;
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
    Checkpoint[] public claimLocks;

    uint256 public lastUpdateBlock;

    // VVV These parameters will be governable by the DAO VVV
    // Percentages are multipl1ied by 1,000,000.
    uint256 public minApr = 2500000; // 2.5%
    uint256 public maxApr = 75000000; // 75%
    uint256 public stakeTarget = 10e6 ether;
    uint256 public updateCoeff = 1000000;
    uint256 public unstakeWaitPeriod = 172800; //4 weeks in blocks @ 14sec/block
    // ^^^ These parameters will be governable by the DAO ^^^

    uint256 public currentApr = minApr;

    uint256 internal onePercent = 1000000;
    uint256 internal hundredPercent = 100000000;

    event Epoch(uint256 indexed epoch, uint256 rewardAmount, uint256 newApr);

    modifier triggerEpochBefore {
        if (!rewards[now / rewardEpochLength].paid) {
            payReward();
        }
        _;
    }

    modifier triggerEpochAfter {
        _;
        if (!rewards[now / rewardEpochLength].paid) {
            payReward();
        }
    }
    
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
        currentApr = currentApr.mul(aprUpdate.add(hundredPercent)).div(hundredPercent);

        if (currentApr > maxApr)
        {
            currentApr = maxApr;
        }
    }

    function payReward()
        internal
    {
        updateCurrentApr();
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 rewardAmount = totalStakedNow.mul(currentApr).div(52).div(100000000);
        uint256 indEpoch = now / rewardEpochLength;
        rewards[indEpoch] = RewardEpoch(true, rewardAmount, block.number);
        emit Epoch(indEpoch, rewardAmount, currentApr);
        //Cover the case when multiple epochs have passed without change in totalStaked
        //We have to add each epoch to the mapping rather than just total the rewards because
        //rewardVestingPeriod is denominated in epochs.
        while (!rewards[indEpoch - 1].paid && indEpoch - 1 >= genesisEpoch) {
            rewards[indEpoch - 1] = RewardEpoch(true, rewardAmount, block.number);
            emit Epoch(indEpoch, rewardAmount, currentApr);
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
        public triggerEpochBefore
    {
        //Reward intervals are sufficiently deterministic for us to access a mapping by epoch instead of iterating over
        //checkpoints. We start totaling locked rewards from epoch T-52 (floor +0) and unlocked rewards from epoch +52.
        uint256 currentEpoch = now / rewardEpochLength;
        uint256 firstUnlockEpoch = genesisEpoch + rewardVestingPeriod;
        uint256 oldestLockedEpoch = currentEpoch >= firstUnlockEpoch ?
                                    currentEpoch - rewardVestingPeriod : genesisEpoch;
        
        uint256 targetBlock = targetEpoch == currentEpoch ? block.number : rewards[targetEpoch].atBlock;
        uint256 updateBlock = targetBlock - 1;

        //Governance updates of unstakeWaitingPeriod are prohibited from exceeding rewardVestingPeriod,
        //so in the extreme future case where we could be targeting an epoch more than rewardVestingPeriod
        //before present, we can just set locked to 0. We prevent exploitation of this elsewhere by explicitly
        //requiring that User is caught up to lastUpdateBlock in order to execute a withdrawal.
        User storage user = users[userAddress];
        uint256 locked = 0;
        if (targetEpoch > oldestLockedEpoch) {
            locked = user.locked;

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
                    uint256 ind = user.lastUpdateClaimIndex < oldestValidClaimIndex ? 
                                  oldestValidClaimIndex : user.lastUpdateClaimIndex + 1;
                    ind < claimLocks.length && claimLocks[ind].fromBlock < updateBlock;
                    ind++
                ) {
                //When a claim is decided, that lock is zeroed because those tokens were either spent or unfrozen.
                    if (claimLocks[ind].value > 0) {
                        Checkpoint storage lock = claimLocks[ind];
                        uint256 totalSharesAtBlock = getValueAt(totalShares, lock.fromBlock);
                        uint256 userSharesAtBlock = getValueAt(user.shares, lock.fromBlock);
                        locked += lock.value.mul(userSharesAtBlock).div(totalSharesAtBlock);
                    }
                }
            }

            for (
                uint256 ind = user.lastUpdateEpoch < oldestLockedEpoch ? oldestLockedEpoch : user.lastUpdateEpoch + 1;
                ind <= currentEpoch;
                ind++
            ) {
                RewardEpoch storage lockedReward = rewards[ind];
                uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
                locked += lockedReward.amount.mul(userSharesThen).div(totalSharesThen);
            }
            if (currentEpoch >= firstUnlockEpoch) {
                for (
                    uint256 ind = user.lastUpdateEpoch < firstUnlockEpoch ? firstUnlockEpoch : user.lastUpdateEpoch + 1;
                    ind <= currentEpoch;
                    ind++
                ) {
                    RewardEpoch storage unlockedReward = rewards[ind - rewardVestingPeriod];
                    uint256 totalSharesThen = getValueAt(totalShares, unlockedReward.atBlock);
                    uint256 userSharesThen = getValueAt(user.shares, unlockedReward.atBlock);
                    locked -= unlockedReward.amount.mul(userSharesThen).div(totalSharesThen);
                }        
            }
        }

        user.locked = locked;
        //We only set the global lastUpdateBlock and user lastUpdateClaimIndex atomically,
        //ie. when fast-forwarding User all the way to present.
        uint256 claimIndexAtUpdate = 0;
        if (updateBlock == block.number - 1) {
            lastUpdateBlock = updateBlock;
            claimIndexAtUpdate = claimLocks.length - 1;
        }
        user.lastUpdateEpoch = targetEpoch;
        user.lastUpdateBlock = updateBlock;
        user.lastUpdateClaimIndex = claimIndexAtUpdate;
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
