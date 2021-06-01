//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./RewardUtils.sol";
import "./interfaces/IDelegationUtils.sol";

/// @title Contract that implements voting power delegation
abstract contract DelegationUtils is RewardUtils, IDelegationUtils {
    /// @notice Called by the user to delegate voting power
    /// @dev User has to be undelegated to call this
    /// @param delegate User address the voting power will be delegated to
    function delegateVotingPower(address delegate) 
        external
        override
    {
        payReward();
        // Delegating users have cannot use their voting power, so we are
        // verifying that the delegate is not currently delegating. However,
        // the delegate may delegate after they have been delegated to.
        require(
            delegate != address(0)
                && delegate != msg.sender
                && userDelegate(delegate) == address(0),
            ERROR_ADDRESS
            );
        User storage user = users[msg.sender];
        // User has to be undelegated
        require(userDelegate(msg.sender) == address(0), ERROR_UNAUTHORIZED);
        // Frequent delegation updates are not allowed to prevent proposal spam
        // and double voting
        require(
            user.mostRecentUndelegationTimestamp + EPOCH_LENGTH < block.timestamp,
            ERROR_UNAUTHORIZED
            );
        // Delegation is not allowed if the user has voted or made a proposal
        // recently to prevent proposal spam and double voting
        require(
            user.mostRecentProposalTimestamp + EPOCH_LENGTH < block.timestamp
                && user.mostRecentVoteTimestamp + EPOCH_LENGTH < block.timestamp,
            ERROR_UNAUTHORIZED
            );
        user.mostRecentDelegationTimestamp = block.timestamp;

        // Assign the new delegation
        User storage _delegate = users[delegate];
        updateCheckpointArray(
            _delegate.delegatedTo,
            userReceivedDelegation(delegate) + userShares(msg.sender)
            );
        // Record the new delegate for the user
        user.delegates.push(AddressCheckpoint({
            fromBlock: block.number,
            _address: delegate
            }));
        emit Delegated(
            msg.sender,
            delegate
            );
    }

    /// @notice Called by the user to undelegate voting power
    /// @dev User has to be delegated to call this
    function undelegateVotingPower()
        external
        override
    {
        payReward();
        User storage user = users[msg.sender];
        address userDelegate = userDelegate(msg.sender);
        // User has to be delegated
        require(
            userDelegate != address(0),
            ERROR_UNAUTHORIZED
            );
        // Frequent delegation updates are not allowed to prevent proposal spam
        // and double voting
        require(
            user.mostRecentDelegationTimestamp + EPOCH_LENGTH < block.timestamp,
            ERROR_UNAUTHORIZED
            );

        User storage delegate = users[userDelegate];
        updateCheckpointArray(
            delegate.delegatedTo,
            userReceivedDelegation(userDelegate) - userShares(msg.sender)
            );
        user.delegates.push(AddressCheckpoint({
            fromBlock: block.number,
            _address: address(0)
            }));
        user.mostRecentUndelegationTimestamp = block.timestamp;
        emit Undelegated(
            msg.sender,
            userDelegate
            );
    }

    /// @notice Called internally when the user shares are updated to update
    /// the delegated voting power
    /// @dev User shares only get updated while staking or unstaking
    /// @param shares Amount of shares that will be added/removed
    /// @param delta Whether the shares will be added/removed (add for `true`,
    /// and vice versa)
    function updateDelegatedVotingPower(
        uint256 shares,
        bool delta
        )
        internal
    {
        address userDelegate = userDelegate(msg.sender);
        if (userDelegate == address(0)) {
            return;
        }

        User storage delegate = users[userDelegate];
        uint256 currentlyDelegatedTo = userReceivedDelegation(userDelegate);
        uint256 newDelegatedTo;
        if (delta) {
            newDelegatedTo = currentlyDelegatedTo + shares;
        } else {
            newDelegatedTo = currentlyDelegatedTo - shares;
        }
        updateCheckpointArray(
            delegate.delegatedTo,
            newDelegatedTo
            );
    }
}
