//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

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
        uint256 userUnstakedUpdate = user.unstaked - amount;
        user.unstaked = userUnstakedUpdate;
        uint256 totalSharesNow = totalShares();
        uint256 sharesToMint = amount * totalSharesNow / totalStake;
        uint256 userSharesUpdate = userShares(msg.sender) + sharesToMint;
        updateCheckpointArray(
            user.shares,
            userSharesUpdate
            );
        uint256 totalSharesUpdate = totalSharesNow + sharesToMint;
        updateCheckpointArray(
            poolShares,
            totalSharesUpdate
            );
        totalStake += amount;
        updateDelegatedVotingPower(sharesToMint, true);
        emit Staked(
            msg.sender,
            amount,
            sharesToMint,
            userUnstakedUpdate,
            userSharesUpdate,
            totalSharesUpdate,
            totalStake
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
    /// scheduled to unstake, or the amount of tokens `shares` corresponds to
    /// at unstaking-time, whichever is smaller. This corresponds to tokens
    /// being scheduled to be unstaked not receiving any rewards, but being
    /// subject to claim payouts.
    /// In the instance that a claim has been paid out before an unstaking is
    /// executed, the user may potentially receive rewards during
    /// `unstakeWaitPeriod` (but not if there has not been a claim payout) but
    /// the amount of tokens that they can unstake will not be able to exceed
    /// the amount they scheduled the unstaking for.
    /// @param amount Amount of tokens scheduled to unstake
    function scheduleUnstake(uint256 amount)
        external
        override
    {
        mintReward();
        uint256 userSharesNow = userShares(msg.sender);
        uint256 totalSharesNow = totalShares();
        uint256 userStaked = userSharesNow * totalStake / totalSharesNow;
        require(
            userStaked >= amount,
            "Pool: Amount exceeds staked"
            );

        User storage user = users[msg.sender];
        require(
            user.unstakeScheduledFor == 0,
            "Pool: Unexecuted unstake exists"
            );

        uint256 sharesToUnstake = amount * totalSharesNow / totalStake;
        // This will only happen if the user wants to schedule an unstake for a
        // few Wei
        require(sharesToUnstake > 0, "Pool: Unstake amount too small");
        uint256 unstakeScheduledFor = block.timestamp + unstakeWaitPeriod;
        user.unstakeScheduledFor = unstakeScheduledFor;
        user.unstakeAmount = amount;
        user.unstakeShares = sharesToUnstake;
        uint256 userSharesUpdate = userSharesNow - sharesToUnstake;
        updateCheckpointArray(
            user.shares,
            userSharesUpdate
            );
        updateDelegatedVotingPower(sharesToUnstake, false);
        emit ScheduledUnstake(
            msg.sender,
            amount,
            sharesToUnstake,
            unstakeScheduledFor,
            userSharesUpdate
            );
    }

    /// @notice Called to execute a pre-scheduled unstake
    /// @dev Anyone can execute a matured unstake. This is to allow the user to
    /// use bots, etc. to execute their unstaking as soon as possible.
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
        uint256 unstakeAmount = user.unstakeAmount;
        uint256 unstakeAmountByShares = user.unstakeShares * totalStake / totalShares;
        // If there was a claim payout in between the scheduling and the actual
        // unstake then the amount might be lower than expected at scheduling
        // time
        if (unstakeAmount > unstakeAmountByShares)
        {
            unstakeAmount = unstakeAmountByShares;
        }
        uint256 userUnstakedUpdate = user.unstaked + unstakeAmount;
        user.unstaked = userUnstakedUpdate;

        uint256 totalSharesUpdate = totalShares - user.unstakeShares;
        updateCheckpointArray(
            poolShares,
            totalSharesUpdate
            );
        totalStake -= unstakeAmount;

        user.unstakeAmount = 0;
        user.unstakeShares = 0;
        user.unstakeScheduledFor = 0;
        emit Unstaked(
            userAddress,
            unstakeAmount,
            userUnstakedUpdate,
            totalSharesUpdate,
            totalStake
            );
        return unstakeAmount;
    }

    /// @notice Convenience method to execute an unstake and withdraw to the
    /// user's wallet in a single transaction
    /// @dev The withdrawal will revert if the user has less than
    /// `unstakeAmount` tokens that are withdrawable
    function unstakeAndWithdraw()
        external
        override
    {
        withdrawRegular(unstake(msg.sender));
    }
}
