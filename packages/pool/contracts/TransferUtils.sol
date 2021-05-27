//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./DelegationUtils.sol";
import "./interfaces/ITransferUtils.sol";

/// @title Contract that implements token transfer functionality
abstract contract TransferUtils is DelegationUtils, ITransferUtils {

    string private constant WRONG_TOTAL_FUNDS =
    "API3DAO.TransferUtils: User total funds should be bigger then locked and amount to withdraw";
    string private constant AMOUNT_TOO_BIG =
    "API3DAO.TransferUtils: Withdrawal amount should be less or equal to the unstaked tokens";
    string private constant ERROR_NOT_ENOUGH_FUNDS =
    "API3DAO.TransferUtils: User don't have enough token to deposit the required amount";

    /// @notice Called to deposit tokens for a user by using `transferFrom()`
    /// @dev This method is used by `TimelockManager.sol`
    /// @param source Token transfer source
    /// @param amount Amount to be deposited
    /// @param userAddress User that the tokens will be deposited for
    function deposit(
        address source,
        uint256 amount,
        address userAddress
        )
        public
        override
    {
        payReward();
        users[userAddress].unstaked = users[userAddress].unstaked + amount;
        require(api3Token.transferFrom(source, address(this), amount), ERROR_NOT_ENOUGH_FUNDS);
        emit Deposited(
            userAddress,
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
        require(userTotalFunds >= lockedAndVesting + amount, WRONG_TOTAL_FUNDS);
        // Carry on with the withdrawal
        require(user.unstaked >= amount, AMOUNT_TOO_BIG);
        user.unstaked = user.unstaked - amount;
        api3Token.transfer(destination, amount);
        emit Withdrawn(msg.sender,
            destination,
            amount
            );
    }
}
