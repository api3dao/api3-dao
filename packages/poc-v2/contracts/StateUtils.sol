//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./auxiliary/interfaces/IApi3Token.sol";
import "hardhat/console.sol";

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
        uint256 unstakeScheduledAt;
        uint256 unstakeAmount;
        mapping(uint256 => bool) revokedEpochReward;
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

    // // `claimPayouts` keeps the block the claim is paid out and its amount
    // Checkpoint[] public claimPayouts;
    // // `claimPayoutReferenceBlocks` maps to `claimPayouts` one-to-one and keeps the
    // // block number the claim was made
    // uint256[] public claimPayoutReferenceBlocks;

    // `locks` keeps both reward locks and claim locks
    Checkpoint[] public locks;
    // `rewardReleases` and `claimReleases` are kept separately because `fromBlock`s
    // of `claimReleases` are not deterministic. We need checkpoints to be
    // chronologically ordered. (Note that this is not a problem with `locks`.)
    Checkpoint[] public rewardReleases;
    Checkpoint[] public claimReleases;
    // Again, we need to keep the block when the claim was made
    uint256[] public claimReleaseReferenceBlocks;
    // Note that we don't need to keep the blocks rewards were paid out at. That's
    // because we know that it was `rewardVestingPeriod` before it will be released.

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
    mapping(uint256 => bool) public rewardPaidForEpoch;
    mapping(uint256 => uint256) public rewardAmounts;
    mapping(uint256 => uint256) public rewardBlocks;
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
            ? currentApr * (100000000 + aprUpdate) / 100000000 : currentApr * (100000000 - aprUpdate) / 100000000;
        
        if (currentApr < minApr)
        {
            currentApr = minApr;
        }
        else if (currentApr > maxApr)
        {
            currentApr = maxApr;
        }
    }

    function payReward()
        private
    {
        updateCurrentApr();
        uint256 indEpoch = now / rewardEpochLength;
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 rewardAmount = totalStakedNow * currentApr / 52 / 100000000;
        rewardPaidForEpoch[indEpoch] = true;
        rewardBlocks[indEpoch] = block.number;
        // We don't want the DAO to revoke minter status from this contract
        // and lock itself out of operation
        if (!api3Token.getMinterStatus(address(this)))
        {
            return;
        }
        if (rewardAmount == 0)
        {
            return;
        }
        rewardAmounts[indEpoch] = rewardAmount;

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
        if (!rewardPaidForEpoch[now / rewardEpochLength])
        {
            payReward();
        }
        User memory user = users[userAddress];
        uint256 userShares = getValueAt(user.shares, block.number);
        uint256 locked = user.locked;
      
        // We should not process events with `fromBlock` of value `targetBlock`. Otherwise,
        // if `targetBlock` is `block.number`, we may miss some of the events depending on tx order.
        // Since we are not processing the events on `targetBlock`, we need to start processing
        // events starting from `lastStateUpdateTargetBlock - 1`
        uint256 lastStateUpdateTargetBlock = user.lastStateUpdateTargetBlock;
        if (lastStateUpdateTargetBlock == 0)
        {
            lastStateUpdateTargetBlock = 1;
        }

        // // We have to record all `shares` checkpoints caused by the claim payouts because
        // // these values are used to calculate the voting power a user will have at a point in
        // // time. Therefore, we can't just calculate the final value and do a single write.
        // // Also, claim payouts need to be processed before locks/releases because the latter depend
        // // on user `shares`, which is updated by claim payouts.
        // uint256 ind;
        // if(lastStateUpdateTargetBlock - 1 < claimPayouts[0].fromBlock) {
        //     ind = 0;
        // } else {
        //     ind = getIndexOf(claimPayouts, lastStateUpdateTargetBlock - 1) + 1;
        // }
        // for (
        //     uint256 _ind = ind;
        //     ind < claimPayouts.length && claimPayouts[ind].fromBlock < targetBlock;
        //     ind++
        // )
        // {
        //     uint256 claimPayoutBlock = claimPayouts[ind].fromBlock;
        //     uint256 totalStakedAtPayout = getValueAt(totalStaked, claimPayoutBlock);
        //     uint256 totalSharesAtPayout = getValueAt(totalShares, claimPayoutBlock);
        //     uint256 totalSharesBurned = claimPayouts[ind].value * totalSharesAtPayout / totalStakedAtPayout;
            
        //     uint256 claimReferenceBlock = claimPayoutReferenceBlocks[ind];
        //     uint256 totalSharesAtClaim = getValueAt(totalShares, claimReferenceBlock);
        //     uint256 userSharesAtClaim = getValueAt(users[userAddress].shares, claimReferenceBlock);

        //     uint256 userSharesBurned = totalSharesBurned * userSharesAtClaim / totalSharesAtClaim;
        //     userShares -= userSharesBurned;
        //     users[userAddress].shares.push(Checkpoint(claimPayoutBlock, userShares));
        // }

        // ... In contrast, `locked` doesn't need to be kept as checkpoints, so we can just
        // calculate the final value and write that once, because we only care about its
        // value at the time of the withdrawal (i.e., at `block.number`).

        Checkpoint[] memory _totalShares = totalShares;

        if (locks.length > 0) {
            Checkpoint[] memory _locks = locks;
            for (
                uint256 ind = lastStateUpdateTargetBlock - 1 < _locks[0].fromBlock ? 0 : getIndexOf(_locks, lastStateUpdateTargetBlock - 1) + 1;
                ind < _locks.length && _locks[ind].fromBlock < targetBlock;
                ind++
            )
            {
                Checkpoint memory lock = _locks[ind];
                uint256 totalSharesAtBlock = getValueAt(_totalShares, lock.fromBlock);
                uint256 userSharesAtBlock = getValueAt(user.shares, lock.fromBlock);
                locked += lock.value * userSharesAtBlock / totalSharesAtBlock;
            }
        }
        

        // for (
        //     uint256 ind = lastStateUpdateTargetBlock - 1 < claimReleases[0].fromBlock ? 0 : getIndexOf(claimReleases, lastStateUpdateTargetBlock - 1) + 1;
        //     ind < claimReleases.length && claimReleases[ind].fromBlock < targetBlock;
        //     ind++
        // )
        // {
        //     uint256 claimReleaseReferenceBlock = claimReleaseReferenceBlocks[ind];
        //     uint256 totalSharesThen = getValueAt(totalShares, claimReleaseReferenceBlock);
        //     uint256 userSharesThen = getValueAt(users[userAddress].shares, claimReleaseReferenceBlock);
        //     // The below will underflow in some cases, cap at 0
        //     locked -= claimReleases[ind].value * userSharesThen / totalSharesThen;
        // }

        if (rewardReleases.length > 0) {
            Checkpoint[] memory _rewardReleases = rewardReleases;
            for (
                uint256 ind = lastStateUpdateTargetBlock - 1 < _rewardReleases[0].fromBlock ? 0 : getIndexOf(_rewardReleases, lastStateUpdateTargetBlock - 1) + 1;
                ind < _rewardReleases.length && _rewardReleases[ind].fromBlock < targetBlock;
                ind++
            )
            {
                uint256 rewardReferenceBlock = _rewardReleases[ind].fromBlock - rewardVestingPeriod;
                uint256 totalSharesThen = getValueAt(_totalShares, rewardReferenceBlock);
                uint256 userSharesThen = getValueAt(user.shares, rewardReferenceBlock);
                // The below will underflow in some cases, cap at 0
                locked -= _rewardReleases[ind].value * userSharesThen / totalSharesThen;
            }
        }
        

        users[userAddress].locked = locked;
        users[userAddress].lastStateUpdateTargetBlock = targetBlock;
    }

    // From https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    function getValueAt(Checkpoint[] memory checkpoints, uint _block) view internal returns (uint) {
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
    function getIndexOf(Checkpoint[] memory checkpoints, uint _block) view internal returns (uint) {
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

    // ~~~ Below are some example usage patterns ~~~

    // The voting app should not be able to get shares if the user state
    // hasn't been updated since the proposal has been made
    function balanceOfAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256)
    {
        // If we don't require this, the user may vote with shares that are supposed to have been slashed
        // require(users[userAddress].lastStateUpdateTargetBlock >= fromBlock);
        User memory user = users[userAddress];
        uint256 shares = getValueAt(user.shares, fromBlock);
        return shares;
    }

    function balanceOf(address userAddress) external view returns (uint256) {
        return this.balanceOfAt(block.number, userAddress);
    }

    // Getters that will be used to populate the dashboard etc. should be preceded
    // by an `updateUserState()` using `block.number`. Otherwise, the returned value
    // may be outdated.
    function updateAndGetBalanceOfAt(
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
