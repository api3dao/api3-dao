//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StateUtils.sol";

contract DelegationUtils is StateUtils {
    constructor(address api3TokenAddress)
        StateUtils(api3TokenAddress)
        public
    {}

    event Delegated(address indexed user, address indexed delegate);
    event Undelegated(address indexed user, address indexed delegate);

    function delegateShares(address delegate) external {
        require(delegate != address(0) && delegate != msg.sender, "Invalid target");
        require(!userDelegating(delegate), "Cannot delegate to a user who is currently delegating");

        User storage user = users[msg.sender];
        uint256 userShares = getValue(user.shares);
        address userDelegate = getDelegateAddress(user.delegates);
        if (userDelegate != address(0)) {
            if (userDelegate == delegate) {
                return;
            } else {
                User storage prevDelegate = users[userDelegate];
                prevDelegate.delegatedTo.push(
                    Checkpoint(block.number, getValue(prevDelegate.delegatedTo).sub(userShares))
                );
            }
        }

        User storage _delegate = users[delegate];
        _delegate.delegatedTo.push(
            Checkpoint(block.number, getValue(_delegate.delegatedTo).add(userShares))
        );
        user.delegates.push(Delegation(block.number, delegate));
        emit Delegated(msg.sender, delegate);
    }

    function undelegateShares() external {
        User storage user = users[msg.sender];
        address userDelegate = getDelegateAddress(user.delegates);
        require(userDelegate != address(0), "Not currently delegating");

        uint256 userShares = getValue(user.shares);
        User storage delegate = users[userDelegate];
        delegate.delegatedTo.push(
            Checkpoint(block.number, getValue(delegate.delegatedTo).sub(userShares))
        );
        user.delegates.push(Delegation(block.number, address(0)));
        emit Undelegated(msg.sender, userDelegate);
    }

    function updateDelegatedUserShares(uint256 shares, bool delta) internal {
        address userDelegate = getDelegateAddress(users[msg.sender].delegates);
        if (userDelegate == address(0) || shares == 0) {
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

    function userDelegatingAt(address userAddress, uint256 _block)
        public view returns (bool)
    {
        address userDelegateAt = getDelegateAddressAt(users[userAddress].delegates, _block);
        return userDelegateAt != address(0);
    }

    function userDelegating(address userAddress)
        public view returns (bool)
    {
        return userDelegatingAt(userAddress, block.number);
    }

    function getDelegateAddressAt(Delegation[] storage checkpoints, uint _block)
        internal view returns (address)
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

    function getDelegateAddress(Delegation[] storage checkpoints)
        internal view returns (address)
    {
        return getDelegateAddressAt(checkpoints, block.number);
    }
}