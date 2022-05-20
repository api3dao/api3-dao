//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./RewardUtils.sol";
import "./interfaces/IDelegationUtils.sol";

/// @title Contract that implements voting power delegation
abstract contract DelegationUtils is RewardUtils, IDelegationUtils {
    /// @notice Called by the user to delegate voting power
    /// @param delegate User address the voting power will be delegated to
    function delegateVotingPower(address delegate) 
        external
        override
    {
        mintReward();
        require(
            delegate != address(0) && delegate != msg.sender,
            "Pool: Invalid delegate"
            );
        // Delegating users cannot use their voting power, so we are
        // verifying that the delegate is not currently delegating. However,
        // the delegate may delegate after they have been delegated to.
        require(
            userDelegate(delegate) == address(0),
            "Pool: Delegate is delegating"
            );
        User storage user = users[msg.sender];
        // Do not allow frequent delegation updates as that can be used to spam
        // proposals
        require(
            user.lastDelegationUpdateTimestamp + EPOCH_LENGTH < block.timestamp,
            "Pool: Updated delegate recently"
            );
        user.lastDelegationUpdateTimestamp = block.timestamp;

        uint256 userShares = userShares(msg.sender);
        require(
            userShares != 0,
            "Pool: Have no shares to delegate"
            );

        address previousDelegate = userDelegate(msg.sender);
        require(
            previousDelegate != delegate,
            "Pool: Already delegated"
            );
        if (previousDelegate != address(0)) {
            // Need to revoke previous delegation
            updateCheckpointArray(
                users[previousDelegate].delegatedTo,
                delegatedToUser(previousDelegate) - userShares
                );
        }

        // Assign the new delegation
        uint256 delegatedToUpdate = delegatedToUser(delegate) + userShares;
        updateCheckpointArray(
            users[delegate].delegatedTo,
            delegatedToUpdate
            );

        // Record the new delegate for the user
        updateAddressCheckpointArray(
            user.delegates,
            delegate
            );
        emit Delegated(
            msg.sender,
            delegate,
            userShares,
            delegatedToUpdate
            );
    }

    /// @notice Called by the user to undelegate voting power
    function undelegateVotingPower()
        external
        override
    {
        mintReward();
        User storage user = users[msg.sender];
        address previousDelegate = userDelegate(msg.sender);
        require(
            previousDelegate != address(0),
            "Pool: Not delegated"
            );
        require(
            user.lastDelegationUpdateTimestamp + EPOCH_LENGTH < block.timestamp,
            "Pool: Updated delegate recently"
            );
        user.lastDelegationUpdateTimestamp = block.timestamp;

        uint256 userShares = userShares(msg.sender);
        uint256 delegatedToUpdate = delegatedToUser(previousDelegate) - userShares;
        updateCheckpointArray(
            users[previousDelegate].delegatedTo,
            delegatedToUpdate
            );
        updateAddressCheckpointArray(
            user.delegates,
            address(0)
            );
        emit Undelegated(
            msg.sender,
            previousDelegate,
            userShares,
            delegatedToUpdate
            );
    }

    /// @notice Called internally when the user shares are updated to update
    /// the delegated voting power
    /// @dev User shares only get updated while staking or scheduling unstaking
    /// @param shares Amount of shares that will be added/removed
    /// @param delta Whether the shares will be added/removed (add for `true`,
    /// and vice versa)
    function updateDelegatedVotingPower(
        uint256 shares,
        bool delta
        )
        internal
    {
        address delegate = userDelegate(msg.sender);
        if (delegate == address(0))
        {
            return;
        }
        uint256 currentDelegatedTo = delegatedToUser(delegate);
        uint256 delegatedToUpdate = delta
            ? currentDelegatedTo + shares
            : currentDelegatedTo - shares;
        updateCheckpointArray(
            users[delegate].delegatedTo,
            delegatedToUpdate
            );
        emit UpdatedDelegation(
            msg.sender,
            delegate,
            delta,
            shares,
            delegatedToUpdate
            );
    }
}
