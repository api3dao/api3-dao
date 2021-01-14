//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./interfaces/IApi3Token.sol";


contract StateUtils {
    struct Checkpoint
    {
        uint256 fromBlock;
        uint256 value;
    }

    struct User
    {
        uint256 unstaked; // Always up to date
        Checkpoint[] shares; // Has to be updated before being used (e.g., voting)
        uint256 locked; // Has to be updated before being used (e.g., withdrawing)
        uint256 lastStateUpdateTargetBlock;
    }

    IApi3Token api3Token;

    // 1 year in blocks, assuming a 13 second-block time
    // floor(60 * 60 * 24 * 365 / 13)
    uint256 public immutable rewardVestingPeriod = 2425846;
    // 1 week in seconds
    uint256 public immutable rewardEpochLength = 60 * 60 * 24 * 7;

    mapping(address => User) public users;

    Checkpoint[] public totalShares; // Always up to date
    Checkpoint[] public totalStaked; // Always up to date

    // `claimPayouts` keeps the block the claim is paid out and its amount
    Checkpoint[] public claimPayouts;
    // `claimPayoutReferenceBlocks` maps to `claimPayouts` one-to-one and keeps the
    // block number the claim was made
    uint256[] public claimPayoutReferenceBlocks;

    // `locks` keeps both reward locks and claim locks
    Checkpoint[] public locks;
    // `rewardReleases` and `claimReleases` are kept separately because `fromBlock`s
    // of `claimReleases` are not deterministic. We need checkpoints to be
    // chronologically ordered. (Note that this is not a problem with `locks`.)
    Checkpoint[] public rewardReleases;
    Checkpoint[] public claimReleases;
    // Again, we need to keep the block when the claim was made
    uint256[] public claimReleaseReferenceBlocks;
    // Note that we don't need to keep the blocks rewards were paid out. That's because
    // we know that it was `rewardVestingPeriod` before it will be released.

    // VVV These parameters will be governable by the DAO VVV
    // Percentages are multiplied by 1,000,000.
    uint256 public minApr = 2500000; // 2.5%
    uint256 public maxApr = 75000000; // 75%
    uint256 public stakeTarget = 10e6 ether; // 10M API3
    // updateCoeff is not in percentages, it's a coefficient that determines
    // how aggresively inflation rate will be updated to meet the target.
    uint256 public updateCoeff = 1000000;
    // ^^^ These parameters will be governable by the DAO ^^^

    // Reward-related state parameters
    mapping(uint256 => bool) public rewardsPaidForEpoch;
    uint256 public currentApr = minApr;
    
    constructor(address api3TokenAddress)
        public
    {
        // Initialize the share price at 1 API3
        totalShares.push(Checkpoint(block.number, 1));
        totalStaked.push(Checkpoint(block.number, 1));
        api3Token = IApi3Token(api3TokenAddress);
    }

    function updateCurrentApr()
        private
    {
        if (stakeTarget == 0)
        {
            currentApr = minApr;
            return;
        }
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;

        uint256 deltaAbsolute = totalStakedNow < stakeTarget 
            ? stakeTarget - totalStakedNow : totalStakedNow - stakeTarget;
        uint256 deltaPercentage = deltaAbsolute * 100000000 / stakeTarget;
        
        // An updateCoeff of 1,000,000 means that for each 1% deviation from the 
        // stake target, APR will be updated by 1%.
        uint256 aprUpdate = deltaPercentage * updateCoeff / 1000000;

        currentApr = totalStakedNow < stakeTarget
            ? currentApr + aprUpdate : currentApr - aprUpdate;
    }

    function payReward()
        private
    {
        updateCurrentApr();
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 rewardAmount = totalStakedNow * currentApr / 52 / 100000000;
        rewardsPaidForEpoch[now / rewardEpochLength] = true;
        if (rewardAmount == 0)
        {
            return;
        }

        totalStaked.push(Checkpoint(block.number, totalStakedNow + rewardAmount));
        locks.push(Checkpoint(block.number, rewardAmount));
        rewardReleases.push(Checkpoint(block.number + rewardVestingPeriod, rewardAmount));
        api3Token.mint(address(this), rewardAmount);
    }

    // `targetBlock` allows us to do partial updates if updating until `block.number`
    // costs too much gas (because, for example, too many claim payouts were made since
    // the last update, which requires the user to create a lot of checkpoints)
    function updateUserState(
        address userAddress,
        uint256 targetBlock
        )
        public
    {
        // Make the reward payment if it wasn't made for this epoch
        if (!rewardsPaidForEpoch[now / rewardEpochLength])
        {
            payReward();
        }

        uint256 userShares = users[userAddress].shares[users[userAddress].shares.length - 1].value;
        uint256 locked = users[userAddress].locked;
      
        // We should not process events with `fromBlock` of value `targetBlock`. Otherwise,
        // if `targetBlock` is `block.number`, we may miss some of the events depending on tx order.
        // Since we are not processing the events on `targetBlock`, we need to start processing
        // events starting from `lastStateUpdateTargetBlock - 1`
        uint256 lastStateUpdateTargetBlock = users[userAddress].lastStateUpdateTargetBlock;
        if (lastStateUpdateTargetBlock == 0)
        {
            lastStateUpdateTargetBlock = 1;
        }

        // We have to record all `shares` checkpoints caused by the claim payouts because
        // these values are used to calculate the voting power a user will have at a point in
        // time. Therefore, we can't just calculate the final value and do a single write.
        // Also, claim payouts need to be processed before locks/releases because the latter depend
        // on user `shares`, which is updated by claim payouts.
        for (
            uint256 ind = getIndexOf(claimPayouts, lastStateUpdateTargetBlock - 1) + 1;
            ind < claimPayouts.length && claimPayouts[ind].fromBlock < targetBlock;
            ind++
        )
        {
            uint256 claimReferenceBlock = claimPayoutReferenceBlocks[ind];
            uint256 totalStakedThen = getValueAt(totalStaked, claimReferenceBlock);
            uint256 totalSharesThen = getValueAt(totalShares, claimReferenceBlock);
            uint256 totalSharesBurnedThen = claimPayouts[ind].value * totalSharesThen / totalStakedThen;
            uint256 userSharesThen = getValueAt(users[userAddress].shares, claimReferenceBlock);
            userShares -= userSharesThen * totalSharesBurnedThen / totalSharesThen;
            users[userAddress].shares.push(Checkpoint(claimPayouts[ind].fromBlock, userShares));
        }

        // ... In contrast, `locked` doesn't need to be kept as checkpoints, so we can just
        // calculate the final value and write that once, because we only care about its
        // value at the time of the withdrawal (i.e., at `block.number`).
        for (
            uint256 ind = getIndexOf(locks, lastStateUpdateTargetBlock - 1) + 1;
            ind < locks.length && locks[ind].fromBlock < targetBlock;
            ind++
        )
        {
            Checkpoint storage lock = locks[ind];
            uint256 totalSharesAtBlock = getValueAt(totalShares, lock.fromBlock);
            uint256 userSharesAtBlock = getValueAt(users[userAddress].shares, lock.fromBlock);
            locked += lock.value * userSharesAtBlock / totalSharesAtBlock;
        }

        for (
            uint256 ind = getIndexOf(claimReleases, lastStateUpdateTargetBlock - 1) + 1;
            ind < claimReleases.length && claimReleases[ind].fromBlock < targetBlock;
            ind++
        )
        {
            uint256 claimReleaseReferenceBlock = claimReleaseReferenceBlocks[ind];
            uint256 totalSharesThen = getValueAt(totalShares, claimReleaseReferenceBlock);
            uint256 userSharesThen = getValueAt(users[userAddress].shares, claimReleaseReferenceBlock);
            locked -= rewardReleases[ind].value * userSharesThen / totalSharesThen;
        }

        for (
            uint256 ind = getIndexOf(rewardReleases, lastStateUpdateTargetBlock - 1) + 1;
            ind < rewardReleases.length && rewardReleases[ind].fromBlock < targetBlock;
            ind++
        )
        {
            uint256 rewardReferenceBlock = rewardReleases[ind].fromBlock - rewardVestingPeriod;
            uint256 totalSharesThen = getValueAt(totalShares, rewardReferenceBlock);
            uint256 userSharesThen = getValueAt(users[userAddress].shares, rewardReferenceBlock);
            locked -= rewardReleases[ind].value * userSharesThen / totalSharesThen;
        }

        users[userAddress].locked = locked;
        users[userAddress].lastStateUpdateTargetBlock = targetBlock;
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

    // Extracted from `getValueAt()`
    function getIndexOf(Checkpoint[] storage checkpoints, uint _block) view internal returns (uint) {
        // Repeating the shortcut
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints.length-1;
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
        return min;
    }

    // ~~~ Below are some example usage patterns ~~~

    // The voting app should not be able to get shares if the user state
    // hasn't been updated since the proposal has been made
    function getUserShares(
        address userAddress,
        uint256 fromBlock
        )
        external
        view
        returns(uint256)
    {
        // If we don't require this, the user may vote with shares that are supposed to have been slashed
        require(users[userAddress].lastStateUpdateTargetBlock >= fromBlock);
        return getValueAt(users[userAddress].shares, fromBlock);
    }

    // Getters that will be used to populate the dashboard etc. should be preceded
    // by an `updateUserState()` using `block.number`. Otherwise, the returned value
    // may be outdated.
    function updateAndGetUserShares(
        address userAddress,
        uint256 fromBlock
        )
        external
        returns(uint256)
    {
        updateUserState(userAddress, fromBlock);
        return getValueAt(users[userAddress].shares, fromBlock);
    }
}
