//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./DelegationUtils.sol";
import "./interfaces/ITransferUtils.sol";

/// @title Contract that implements token transfer functionality
abstract contract TransferUtils is DelegationUtils, ITransferUtils {
    /// @notice Called by the user to deposit tokens
    /// @dev The user should approve the pool to spend at least `amount` tokens
    /// before calling this.
    /// The method is named `depositRegular()` to prevent potential confusion
    /// (for example it is difficult to differentiate overloaded functions in
    /// JS). See `deposit()` for more context.
    /// @param amount Amount to be deposited
    function depositRegular(uint256 amount)
        public
        override
    {
        payReward();
        users[msg.sender].unstaked = users[msg.sender].unstaked + amount;
        api3Token.transferFrom(msg.sender, address(this), amount);
        emit Deposited(
            msg.sender,
            amount
            );
    }

    /// @notice Called by the user to withdraw tokens
    /// @dev The user should call `getUserLocked()` beforehand to ensure that
    /// they have at least `amount` unlocked tokens to withdraw.
    /// The method is named `withdrawRegular()` to be consistent with the name
    /// `depositRegular()`. See `depositRegular()` for more context.
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    function withdrawRegular(
        address destination,
        uint256 amount
        )
        public
        override
    {
        payReward();
        User storage user = users[msg.sender];
        uint256 userLocked = getUserLocked(msg.sender);
        // Check if the user has `amount` unlocked tokens to withdraw
        uint256 lockedAndVesting = userLocked + user.vesting;
        uint256 userTotalFunds = user.unstaked + userStake(msg.sender);
        require(userTotalFunds >= lockedAndVesting + amount, ERROR_VALUE);
        // Carry on with the withdrawal
        require(user.unstaked >= amount, ERROR_VALUE);
        user.unstaked = user.unstaked - amount;
        api3Token.transfer(destination, amount);
        emit Withdrawn(msg.sender,
            destination,
            amount
            );
    }
}
