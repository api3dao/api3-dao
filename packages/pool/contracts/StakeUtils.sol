//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./TransferUtils.sol";
import "./interfaces/IStakeUtils.sol";

/// @title Contract that implements staking functionality
abstract contract StakeUtils is TransferUtils, IStakeUtils {
    /// @notice Called to stake tokens to receive pools in the share
    /// @param amount Amount of tokens to stake
    function stake(uint256 amount)
        public
        override
    {
        mintReward();
        User storage user = users[msg.sender];
        require(
            user.unstaked >= amount,
            "Pool: Amount exceeds unstaked"
            );
        user.unstaked -= amount;
        uint256 totalSharesNow = totalShares();
        uint256 sharesToMint = totalSharesNow * amount / totalStake;
        uint256 userSharesNow = userShares(msg.sender);
        user.shares.push(Checkpoint({
            fromBlock: block.number,
            value: userSharesNow + sharesToMint
            }));
        uint256 totalSharesAfter = totalSharesNow + sharesToMint; 
        updateTotalShares(totalSharesAfter);
        totalStake += amount;
        updateDelegatedVotingPower(sharesToMint, true);
        emit Staked(
            msg.sender,
            amount
            );
    }

    /// @notice Convenience method to deposit and stake in a single transaction
    /// @param amount Amount to be deposited and staked
    function depositAndStake(uint256 amount)
        external
        override
    {
        depositRegular(amount);
        stake(amount);
    }

    /// @notice Called by the user to schedule unstaking of their tokens
    /// @dev While scheduling an unstake, `shares` get deducted from the user,
    /// meaning that they will not receive rewards or voting power for them any
    /// longer.
    /// At unstaking-time, the user unstakes either the amount of tokens
    /// `shares` corresponds to at scheduling-time, or the amount of tokens
    /// `shares` corresponds to at unstaking-time, whichever is smaller. This
    /// corresponds to tokens being scheduled to be unstaked not receiving any
    /// rewards, but being subject to claim payouts.
    /// In the instance that a claim has been paid out before an unstaking is
    /// executed, the user may potentially receive rewards during
    /// `unstakeWaitPeriod` (but not if there has not been a claim payout) but
    /// the amount of tokens that they can unstake will not be able to exceed
    /// the amount they scheduled the unstaking for.
    /// @param shares Amount of shares to be revoked to unstake tokens
    function scheduleUnstake(uint256 shares)
        external
        override
    {
        mintReward();
        uint256 userSharesNow = userShares(msg.sender);
        require(
            userSharesNow >= shares,
            "Pool: Amount exceeds user shares"
            );
        User storage user = users[msg.sender];
        require(
            user.unstakeScheduledFor == 0,
            "Pool: Unexecuted unstake exists"
            );
        uint256 amount = shares * totalStake / totalShares();
        user.unstakeScheduledFor = block.timestamp + unstakeWaitPeriod;
        user.unstakeAmount = amount;
        user.unstakeShares = shares;
        user.shares.push(
            Checkpoint({fromBlock: block.number, value: userSharesNow - shares})
        );
        updateDelegatedVotingPower(shares, false);
        emit ScheduledUnstake(
            msg.sender,
            shares,
            amount,
            user.unstakeScheduledFor
        );
    }

    /// @notice Called to execute a pre-scheduled unstake
    /// @dev Note that anyone can execute a matured unstake. This is to allow
    /// the user to use bots, etc. to execute their unstaking as soon as
    /// possible.
    /// @param userAddress User address
    /// @return Amount of tokens that are unstaked
    function unstake(address userAddress)
        public
        override
        returns (uint256)
    {
        mintReward();
        User storage user = users[userAddress];
        require(
            user.unstakeScheduledFor != 0,
            "Pool: No unstake scheduled"
            );
        require(
            user.unstakeScheduledFor < block.timestamp,
            "Pool: Unstake not mature yet"
            );
        uint256 totalShares = totalShares();
        uint256 unstakeAmountAtSchedulingTime = user.unstakeAmount;
        uint256 unstakeAmountByShares =
            (user.unstakeShares * totalStake) / totalShares;
        uint256 unstakeAmount =
            unstakeAmountAtSchedulingTime > unstakeAmountByShares
                ? unstakeAmountByShares
                : unstakeAmountAtSchedulingTime;
        unstakeAmount = unstakeAmount < totalStake
            ? unstakeAmount
            : totalStake - 1;
        user.unstaked += unstakeAmount;

        updateTotalShares(totalShares - user.unstakeShares);
        totalStake -= unstakeAmount;

        user.unstakeShares = 0;
        user.unstakeAmount = 0;
        user.unstakeScheduledFor = 0;
        emit Unstaked(userAddress, unstakeAmount);
        return unstakeAmount;
    }

    /// @notice Convenience method to execute an unstake and withdraw to the
    /// user's wallet in a single transaction
    /// @dev Note that withdraw may revert because the user may have less than
    /// `unstaked` tokens that are withdrawable
    function unstakeAndWithdraw()
        external
        override
    {
        uint256 unstaked = unstake(msg.sender);
        withdrawRegular(unstaked);
    }
}
