//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

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
        // Do not allow frequent delegation updates as that can be used to spam
        // proposals
        require(
            user.lastDelegationUpdateTimestamp + EPOCH_LENGTH < block.timestamp,
            ERROR_UNAUTHORIZED
            );
        user.lastDelegationUpdateTimestamp = block.timestamp;
        
        address previousDelegate = userDelegate(msg.sender);
        require(previousDelegate != delegate, ERROR_DELEGATE);

        uint256 userShares = userShares(msg.sender);
        require(userShares != 0, ERROR_UNAUTHORIZED);
        if (previousDelegate != address(0)) {
            // Need to revoke previous delegation
            users[previousDelegate].delegatedTo.push(Checkpoint({
                fromBlock: block.number,
                value: delegatedToUser(previousDelegate) - userShares
                }));
        }
        // Assign the new delegation
        User storage _delegate = users[delegate];
        _delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: delegatedToUser(delegate) + userShares
            }));
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
    function undelegateVotingPower()
        external
        override
    {
        mintReward();
        User storage user = users[msg.sender];
        address previousDelegate = userDelegate(msg.sender);
        require(
            previousDelegate != address(0)
                && user.lastDelegationUpdateTimestamp + EPOCH_LENGTH < block.timestamp,
            ERROR_UNAUTHORIZED
            );

        uint256 userShares = userShares(msg.sender);
        User storage delegate = users[previousDelegate];
        delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: delegatedToUser(previousDelegate) - userShares
            }));
        user.delegates.push(AddressCheckpoint({
            fromBlock: block.number,
            _address: address(0)
            }));
        user.lastDelegationUpdateTimestamp = block.timestamp;
        emit Undelegated(
            msg.sender,
            previousDelegate
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
        address currentDelegate = userDelegate(msg.sender);
        if (currentDelegate == address(0)) {
            return;
        }

        User storage delegate = users[currentDelegate];
        uint256 currentlyDelegatedTo = delegatedToUser(currentDelegate);
        uint256 newDelegatedTo;
        if (delta) {
            newDelegatedTo = currentlyDelegatedTo + shares;
        } else {
            newDelegatedTo = currentlyDelegatedTo - shares;
        }
        delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: newDelegatedTo
            }));
    }
}
