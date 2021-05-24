//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./DelegationUtils.sol";
import "./interfaces/ITransferUtils.sol";

/// @title Contract that implements token transfer functionality
abstract contract TransferUtils is DelegationUtils, ITransferUtils {
    /// @notice Called to deposit tokens for a user by using `transferFrom()`
    /// @param amount Amount to be deposited
    function deposit(uint256 amount)
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

    /// @notice Called to withdraw tokens
    /// @dev The user should call `getUserLocked()` beforehand to ensure that
    /// they have at least `amount` unlocked tokens to withdraw
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    function withdraw(
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
