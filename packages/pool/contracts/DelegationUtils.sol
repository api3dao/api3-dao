//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StateUtils.sol";

/// @title Contract that implements voting power delegation
contract DelegationUtils is StateUtils {
    constructor(address api3TokenAddress)
        StateUtils(api3TokenAddress)
        public
    {}

    event Delegated(
        address indexed user,
        address indexed delegate
        );

    event Undelegated(
        address indexed user,
        address indexed delegate
        );

    /// @notice Called by the user to delegate voting power
    /// @param delegate User address the voting power will be delegated to
    function delegateShares(address delegate) 
        external 
    {
        require(delegate != address(0) && delegate != msg.sender, "Invalid target");
        // Although we are checking for this, the delegate may delegate to
        // someone else after being delegated to. 
        require(!userDelegating(delegate), "Delegate is delegating");

        User storage user = users[msg.sender];
        uint256 userShares = getValue(user.shares);
        address userDelegate = getDelegateAddress(user.delegates);
        if (userDelegate != address(0)) {
            if (userDelegate == delegate) {
                return;
            } else {
                // Need to revoke previous delegation
                User storage prevDelegate = users[userDelegate];
                prevDelegate.delegatedTo.push(
                    Checkpoint(block.number, getValue(prevDelegate.delegatedTo).sub(userShares))
                );
            }
        }
        // Assign the new delegation
        User storage _delegate = users[delegate];
        _delegate.delegatedTo.push(
            Checkpoint(block.number, getValue(_delegate.delegatedTo).add(userShares))
        );
        // Record the new delegate for the user
        user.delegates.push(Delegation(block.number, delegate));
        emit Delegated(msg.sender, delegate);
    }

    /// @notice Called by the user to undelegate voting power
    function undelegateShares()
        external
    {
        User storage user = users[msg.sender];
        address userDelegate = getDelegateAddress(user.delegates);
        require(userDelegate != address(0), "Not delegated");

        uint256 userShares = getValue(user.shares);
        User storage delegate = users[userDelegate];
        delegate.delegatedTo.push(
            Checkpoint(block.number, getValue(delegate.delegatedTo).sub(userShares))
        );
        user.delegates.push(Delegation(block.number, address(0)));
        emit Undelegated(msg.sender, userDelegate);
    }

    /// @notice Called internally when the user shares are updated to update
    /// the delegated voting power
    /// @dev User shares only get updated while staking, scheduling unstaking
    /// or unstaking
    /// @param shares Amount of shares that will be added/removed
    /// @param delta Whether the shares will be added/removed (add for `true`
    /// and vice versa)
    function updateDelegatedUserShares(
        uint256 shares,
        bool delta
        )
        internal
    {
        if (shares == 0)
        {
            return;
        }
        address userDelegate = getDelegateAddress(users[msg.sender].delegates);
        if (userDelegate == address(0)) {
            return;
        }

        User storage delegate = users[userDelegate];
        uint256 currentlyDelegatedTo = getValue(delegate.delegatedTo);
        uint256 newDelegatedTo;
        if (delta) {
            newDelegatedTo = currentlyDelegatedTo.add(shares);
        } else {
            newDelegatedTo = currentlyDelegatedTo > shares ? currentlyDelegatedTo.sub(shares) : 0;
        }
        delegate.delegatedTo.push(
            Checkpoint(block.number, newDelegatedTo)
        );
    }

    /// @notice Called to check if the user is delegating at a specific block
    /// @param userAddress User address
    /// @param _block Block number
    /// @return Whether the user is delegating at the specific block
    function userDelegatingAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        returns(bool)
    {
        address userDelegateAt = getDelegateAddressAt(users[userAddress].delegates, _block);
        return userDelegateAt != address(0);
    }

    /// @notice Called to check if the user is currently delegating
    /// @param userAddress User address
    /// @return Whether the user is currently delegating
    function userDelegating(address userAddress)
        public
        view
        returns(bool)
    {
        return userDelegatingAt(userAddress, block.number);
    }

    /// @notice Called to get which address the user is delegating to at a
    /// specific block
    /// @dev This is same as `getValueAt()` in `StateUtils`, except the value
    /// being kept in the checkpoints is an address
    /// @param checkpoints Delegation checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Delegate of the user at the block
    function getDelegateAddressAt(
        Delegation[] storage checkpoints,
        uint _block
        )
        internal
        view
        returns(address)
    {
        if (checkpoints.length == 0)
            return address(0);

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock)
            return checkpoints[checkpoints.length.sub(1)].delegate;
        if (_block < checkpoints[0].fromBlock)
            return address(0);

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length.sub(1);
        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }
        return checkpoints[min].delegate;
    }

    /// @notice Called to get current delegate of the user
    /// @param checkpoints Delegation checkpoints array
    /// @return Current delegate of the user
    function getDelegateAddress(Delegation[] storage checkpoints)
        internal
        view
        returns(address)
    {
        return getDelegateAddressAt(checkpoints, block.number);
    }
}
