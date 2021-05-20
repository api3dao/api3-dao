//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./RewardUtils.sol";
import "./interfaces/IDelegationUtils.sol";

/// @title Contract that implements voting power delegation
abstract contract DelegationUtils is RewardUtils, IDelegationUtils {

    string internal constant ERROR_DELEGATION_BALANCE = "API3DAO.DelegationUtils: Cannot delegate zero shares";
    string internal constant ERROR_DELEGATION_ADRESSES =
    "API3DAO.DelegationUtils: Cannot delegate to yourself or zero address and if you've already delegated";
    string internal constant ERROR_DELEGATED_RECENTLY =
    "API3DAO.DelegationUtils: This address un/delegated less than a week before";
    string internal constant ERROR_ACTIVE_RECENTLY =
    "API3DAO.DelegationUtils: This address voted or made a proposal less than a week before";

    /// @notice Called by the user to delegate voting power
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
                ERROR_DELEGATION_ADRESSES
            );
        User storage user = users[msg.sender];
        // Do not allow frequent delegation updates as that can be used to spam
        // proposals
        require(
            user.mostRecentDelegationTimestamp <= block.timestamp - EPOCH_LENGTH
                && user.mostRecentUndelegationTimestamp <= block.timestamp - EPOCH_LENGTH,
                ERROR_DELEGATED_RECENTLY
            );
        // Do not allow the user to delegate if they have voted or made a proposal
        // recently
        require(
            user.mostRecentProposalTimestamp <= block.timestamp - EPOCH_LENGTH
                && user.mostRecentVoteTimestamp <= block.timestamp - EPOCH_LENGTH,
                ERROR_ACTIVE_RECENTLY
            );
        user.mostRecentDelegationTimestamp = block.timestamp;
        uint256 userShares = userShares(msg.sender);
        address userDelegate = userDelegate(msg.sender);
        require(userShares > 0, ERROR_DELEGATION_BALANCE );
        require(userDelegate != delegate, ERROR_DELEGATE);

        if (userDelegate != address(0)) {
            // Need to revoke previous delegation
            updateCheckpointArray(
                users[userDelegate].delegatedTo,
                userReceivedDelegation(userDelegate) - userShares
                );
            emit Undelegated(
                msg.sender,
                userDelegate
            );
        }
        // Assign the new delegation
        User storage _delegate = users[delegate];
        updateCheckpointArray(
            _delegate.delegatedTo,
            userReceivedDelegation(delegate) + userShares
            );
        // Record the new delegate for the user
        updateAddressCheckpointArray(
            user.delegates,
            delegate
            );
        emit Delegated(
            msg.sender,
            delegate
            );
    }

    /// @notice Called by the user to undelegate voting power
    function undelegateVotingPower()
        external
        override
    {
        payReward();
        User storage user = users[msg.sender];
        address userDelegate = userDelegate(msg.sender);
        require(
            userDelegate != address(0)
                && user.mostRecentDelegationTimestamp <= block.timestamp - EPOCH_LENGTH
                && user.mostRecentUndelegationTimestamp <= block.timestamp - EPOCH_LENGTH,
            ERROR_DELEGATED_RECENTLY
            );

        uint256 userShares = userShares(msg.sender);
        User storage delegate = users[userDelegate];
        updateCheckpointArray(
            delegate.delegatedTo,
            userReceivedDelegation(userDelegate) - userShares
            );
        updateAddressCheckpointArray(
            user.delegates,
            address(0)
            );
        user.mostRecentUndelegationTimestamp = block.timestamp;
        emit Undelegated(
            msg.sender,
            userDelegate
            );
    }

    /// @notice Called internally when the user shares are updated to update
    /// the delegated voting power
    /// @dev User shares only get updated while staking, scheduling unstake
    /// or unstaking
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
            newDelegatedTo = currentlyDelegatedTo > shares
                ? currentlyDelegatedTo - shares
                : 0;
        }
        updateCheckpointArray(
            delegate.delegatedTo,
            newDelegatedTo
            );
    }
}
