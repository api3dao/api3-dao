//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./GetterUtils.sol";

contract TransferUtils is GetterUtils {
    constructor(address api3TokenAddress)
        GetterUtils(api3TokenAddress)
        public
    {}

    // Note that this method is used by TimelockManager.sol
    function deposit(
        address source,
        uint256 amount,
        address userAddress
        )
        public
    {
        users[userAddress].unstaked += amount;
        api3Token.transferFrom(source, address(this), amount);
    }

    function withdraw(
        address destination,
        uint256 amount
        )
        public
    {
        // We have to update user state because we need the current `locked`
        updateUserLock(msg.sender, block.number);
        require(users[msg.sender].unstaked - users[msg.sender].locked >= amount);
        users[msg.sender].unstaked -= amount;
        api3Token.transfer(destination, amount);
    }
}
