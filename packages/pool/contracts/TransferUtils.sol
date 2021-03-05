//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./GetterUtils.sol";

/// @title Contract that implement the token transfer functionality
contract TransferUtils is GetterUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        GetterUtils(api3TokenAddress)
        public
    {}

    event Deposited(
        address indexed user,
        uint256 amount
        );

    event Withdrew(
        address indexed user,
        address indexed destination,
        uint256 amount
        );

    /// @notice Called to deposit tokens for a beneficiary
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
    {
        users[userAddress].unstaked = users[userAddress].unstaked.add(amount);
        api3Token.transferFrom(source, address(this), amount);
        emit Deposited(userAddress, amount);
    }

    /// @notice Called to withdraw tokens
    /// @dev The user should call `getUserLockedAt()` beforehand to ensure that
    /// they have `amount` unlocked tokens to withdraw
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    function withdraw(
        address destination,
        uint256 amount
        )
        public
    {
        // Since the following operation depends on the number of locked tokens
        // of the user, update that first
        uint256 currentEpoch = now.div(epochLength);
        User storage user = users[msg.sender];
        if (user.lastUpdateEpoch != currentEpoch) {
            updateUserLocked(msg.sender, currentEpoch);
        }
        // Check if the user has `amount` unlocked tokens to withdraw
        uint256 lockedAndVesting = user.locked.add(user.vesting);
        uint256 unlocked = user.unstaked > lockedAndVesting ? user.unstaked.sub(lockedAndVesting) : 0;
        require(unlocked >= amount, "Amount exceeds available balance");
        // Carry on with the withdrawal
        user.unstaked = user.unstaked.sub(amount);
        api3Token.transfer(destination, amount);
        emit Withdrew(msg.sender, destination, amount);
    }
}
