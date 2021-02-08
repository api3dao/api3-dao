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
        public
    {
        //Pay reward to update totalStaked if that hasn't occurred yet for this epoch
        if (!rewards[now / rewardEpochLength].paid)
        {
            payReward();
        }
        User storage user = users[msg.sender];
        require(user.unstaked >= amount);
        user.unstaked -= amount;
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 sharesToMint = totalSharesNow * amount / totalStakedNow;
        uint256 userSharesNow = getValue(user.shares);
        user.shares.push(Checkpoint(block.number, userSharesNow + sharesToMint));
        totalShares.push(Checkpoint(block.number, totalSharesNow + sharesToMint));
        totalStaked.push(Checkpoint(block.number, totalStakedNow + amount));
    }

    function depositAndStake(
        address source,
        uint256 amount,
        address userAddress
    ) external {
        deposit(source, amount, userAddress);
        stake(amount);
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
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalSharesNow = getValue(totalShares);
        User storage user = users[msg.sender];
        uint256 userSharesNow = getValue(user.shares);

        // Revoke this epoch's reward if we haven't already
        uint256 current = now / rewardEpochLength;
        uint256 tokensToRevoke = 0;
        if (!user.revokedEpochReward[current] && rewards[current].amount != 0) {
            RewardEpoch storage currentEpoch = rewards[current];
            uint256 userSharesThen = getValueAt(user.shares, currentEpoch.atBlock);
            uint256 totalSharesThen = getValueAt(totalShares, currentEpoch.atBlock);

            tokensToRevoke = currentEpoch.amount * userSharesThen / totalSharesThen;
            uint256 sharesToBurn = totalSharesNow * tokensToRevoke / totalStakedNow;
            if (sharesToBurn > userSharesNow) {
                sharesToBurn = userSharesNow;
            }

            userSharesNow -= sharesToBurn;
            totalSharesNow -= sharesToBurn;
            user.shares.push(Checkpoint(block.number, userSharesNow));
            totalShares.push(Checkpoint(block.number, totalSharesNow));
            
            user.locked -= tokensToRevoke;
            user.revokedEpochReward[current] = true;
        }
        uint256 userStakedNow = userSharesNow * totalStakedNow / totalSharesNow;
        // We have to check this because otherwise the user can schedule an unstake 1 week ago
        // for infinite tokens, take a flash loan, vote on a proposal, unstake, withdraw and return
        // the loan.
        require(amount <= userStakedNow + tokensToRevoke, "Insufficient amount");
        user.unstakeScheduledAt = now;
        user.unstakeAmount = amount;
    }

    function unstake()
        public
    {
        User storage user = users[msg.sender];
        require(
            now > user.unstakeScheduledAt + unstakeWaitPeriod
                && now < user.unstakeScheduledAt + unstakeWaitPeriod + rewardEpochLength * 2
            );
        uint256 amount = user.unstakeAmount;
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 userSharesNow = getValue(user.shares);
        uint256 sharesToBurn = totalSharesNow * amount / totalStakedNow;
        // If the user doesn't have the tokens to be unstaked, unstake as much as possible
        if (sharesToBurn > userSharesNow)
        {
            sharesToBurn = userSharesNow;
            amount = sharesToBurn * totalStakedNow / totalSharesNow;
        }
        user.unstaked += amount;
        user.shares.push(Checkpoint(block.number, userSharesNow - sharesToBurn));
        totalShares.push(Checkpoint(block.number, totalSharesNow - sharesToBurn));
        totalStaked.push(Checkpoint(block.number, totalStakedNow - amount));
        // Reset the schedule
        user.unstakeScheduledAt = 0;
        user.unstakeAmount = 0;
        //Trigger reward and update APR if it hasn't happened for this epoch already
        if (!rewards[now / rewardEpochLength].paid)
        {
            payReward();
        }
    }

    function unstakeAndWithdraw(address destination, uint256 amount) external {
        unstake();
        withdraw(destination, amount);
    }
}