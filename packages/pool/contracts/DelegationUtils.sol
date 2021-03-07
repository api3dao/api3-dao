//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./RewardUtils.sol";
import "./interfaces/IDelegationUtils.sol";

/// @title Contract that implements voting power delegation
contract DelegationUtils is RewardUtils, IDelegationUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        public
        RewardUtils(api3TokenAddress)
    {}

    /// @notice Called by the user to delegate voting power
    /// @param delegate User address the voting power will be delegated to
    function delegateVotingPower(address delegate) 
        external
        override
    {
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
            user.lastDelegationUpdateTimestamp <= now.sub(EPOCH_LENGTH),
            ERROR_UNAUTHORIZED
            );
        user.lastDelegationUpdateTimestamp = now;
        uint256 userShares = getValue(user.shares);
        address userDelegate = getAddress(user.delegates);
        if (userDelegate == delegate) {
            return;
        }
        if (userDelegate != address(0)) {
            // Need to revoke previous delegation
            User storage prevDelegate = users[userDelegate];
            prevDelegate.delegatedTo.push(Checkpoint({
                fromBlock: block.number,
                value: getValue(prevDelegate.delegatedTo).sub(userShares)
                }));
        }
        // Assign the new delegation
        User storage _delegate = users[delegate];
        _delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: getValue(_delegate.delegatedTo).add(userShares)
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
        User storage user = users[msg.sender];
        address userDelegate = getAddress(user.delegates);
        require(
            userDelegate != address(0)
                && user.lastDelegationUpdateTimestamp <= now.sub(EPOCH_LENGTH),
            ERROR_UNAUTHORIZED
            );

        uint256 userShares = getValue(user.shares);
        User storage delegate = users[userDelegate];
        delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: getValue(delegate.delegatedTo).sub(userShares)
            }));
        user.delegates.push(AddressCheckpoint({
            fromBlock: block.number,
            _address: address(0)
            }));
        user.lastDelegationUpdateTimestamp = now;
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
        address userDelegate = getAddress(users[msg.sender].delegates);
        if (userDelegate == address(0)) {
            return;
        }

        User storage delegate = users[userDelegate];
        uint256 currentlyDelegatedTo = getValue(delegate.delegatedTo);
        uint256 newDelegatedTo;
        if (delta) {
            newDelegatedTo = currentlyDelegatedTo.add(shares);
        } else {
            newDelegatedTo = currentlyDelegatedTo > shares 
                ? currentlyDelegatedTo.sub(shares)
                : 0;
        }
        delegate.delegatedTo.push(Checkpoint({
            fromBlock: block.number,
            value: newDelegatedTo
            }));
    }
}
