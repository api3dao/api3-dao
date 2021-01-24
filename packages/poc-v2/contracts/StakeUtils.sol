//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TransferUtils.sol";
import "hardhat/console.sol";

contract StakeUtils is TransferUtils {
    constructor(address api3TokenAddress)
        TransferUtils(api3TokenAddress)
        public
    {}
    
    function stake(uint256 amount)
        external
    {
        // We have to update user state because we need the current `shares`
        updateUserState(msg.sender, block.number);
        require(users[msg.sender].unstaked >= amount);
        users[msg.sender].unstaked -= amount;
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 sharesToMint = totalSharesNow * amount / totalStakedNow;
        User memory user = users[msg.sender];
        uint256 userSharesNow = user.shares.length > 0 ? user.shares[user.shares.length - 1].value : 0;
        users[msg.sender].shares.push(Checkpoint(block.number, userSharesNow + sharesToMint));
        totalShares.push(Checkpoint(block.number, totalSharesNow + sharesToMint));
    }

    // We can't let the user unstake on demand. Otherwise, they would be able to unstake
    // instantly as soon as anything went wrong, evading being slashed by an insurance claim.
    // As a solution, we require the user to "schedule an unstake" `rewardEpochLength` (1 week)
    // in advance.
    // This system by itself is also open to abuse, as the user can schedule an unstake event, but
    // not execute it. Then, as soon as an event occurs that will result in an insurance claim, they will
    // execute the unstake. As a solution, scheduled unstake events "go stale" `2 * rewardEpochLength`
    // (2 weeks) after they are scheduled. In other words, the user has a 1 week window to unstake,
    // starting from 1 week after the unstake has been scheduled.
    // This system is again open to abuse, as the users will schedule unstake events biweekly
    // even though they have no intention of unstaking, just to be able to unstake at will in one
    // in every two weeks (i.e., the user is able to evade claims 50% of the time). As a solution,
    // scheduling an unstake event costs the user their inflationary rewards for the epoch they
    // are in. In other words, always having an active unstake scheduling will also cost the user
    // 50% of their inflationary rewards.
    function scheduleUnstake(uint256 amount)
        external
    {
        // We have to update user state because we need the current `shares`
        updateUserState(msg.sender, block.number);
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 userSharesNow = users[msg.sender].shares[users[msg.sender].shares.length - 1].value;
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        // Revoke this epoch's reward if we haven't already
        uint256 indEpoch = now / rewardEpochLength;    
        uint256 tokensToRevoke = 0;
        if (!users[msg.sender].revokedEpochReward[indEpoch] && rewardAmounts[indEpoch] != 0)
        {
            // Calculate how many tokens the user was paid as inflationary rewards
            uint256 userSharesThen = getValueAt(users[msg.sender].shares, rewardBlocks[indEpoch]);
            uint256 totalSharesThen = getValueAt(totalShares, rewardBlocks[indEpoch]);
            tokensToRevoke = rewardAmounts[indEpoch] * userSharesThen / totalSharesThen;
            // Calculate how many shares they correspond to now
            uint256 sharesToBurn = totalSharesNow * tokensToRevoke / totalStakedNow;
            // The user may have been slashed since the reward payment, resulting in them
            // having less shares than the reward payment (unlikely, but possible)
            if (sharesToBurn > userSharesNow)
            {
                sharesToBurn = userSharesNow;
            }
            // Deduct these shares from the user, practically distributing them to the current shareholders.
            // (The ideal thing would be to distribute them to shareholders at the time the
            // reward payment was made, but that's not feasible to implement.)
            userSharesNow -= sharesToBurn;
            totalSharesNow -= sharesToBurn;
            users[msg.sender].shares.push(Checkpoint(block.number, userSharesNow));
            totalShares.push(Checkpoint(block.number, totalSharesNow));
            // Also unlock the tokens. Note that these tokens will be unlocked again 1 year later (so
            // this favors the user) but this is acceptable (or rather the opposite is less desirable). 
            users[msg.sender].locked -= tokensToRevoke;
            // We don't want to repeat this penalty if the user refreshes their unstake schedule in the same
            // epoch a second time
            users[msg.sender].revokedEpochReward[indEpoch] = true;
        }
        uint256 userStakedNow = userSharesNow * totalStakedNow / totalSharesNow;
        // We have to check this because otherwise the user can schedule an unstake 1 week ago
        // for infinite tokens, take a flash loan, vote on a proposal, unstake, withdraw and return
        // the loan.
        require(amount <= userStakedNow + tokensToRevoke);
        users[msg.sender].unstakeScheduledAt = now;
        users[msg.sender].unstakeAmount = amount;
    }

    function unstake()
        external
    {
        // Note that these time limits are hardcoded and not governable
        require(
            now > users[msg.sender].unstakeScheduledAt + rewardEpochLength
                && now < users[msg.sender].unstakeScheduledAt + rewardEpochLength * 2
            );
        uint256 amount = users[msg.sender].unstakeAmount;
        // We have to update user state because we need the current `shares`
        updateUserState(msg.sender, block.number);
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 userSharesNow = users[msg.sender].shares[users[msg.sender].shares.length - 1].value;
        uint256 sharesToBurn = totalSharesNow * amount / totalStakedNow;
        // If the user doesn't have the tokens to be unstaked, unstake as much as possible
        if (sharesToBurn > userSharesNow)
        {
            sharesToBurn = userSharesNow;
            amount = sharesToBurn * totalStakedNow / totalSharesNow;
        }
        users[msg.sender].unstaked += amount;
        users[msg.sender].shares.push(Checkpoint(block.number, userSharesNow - sharesToBurn));
        totalShares.push(Checkpoint(block.number, totalSharesNow - sharesToBurn));
        // Reset the schedule
        users[msg.sender].unstakeScheduledAt = 0;
        users[msg.sender].unstakeAmount = 0;
    }
}