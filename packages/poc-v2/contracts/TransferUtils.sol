//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./GetterUtils.sol";

contract TransferUtils is GetterUtils {
    constructor(address api3TokenAddress)
        GetterUtils(api3TokenAddress)
        public
    {}

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, address indexed destination, uint256 amount);

    modifier forceFastForward(address userAddress) {
        if (users[userAddress].lastUpdateBlock < lastUpdateBlock) {
            updateUserLock(userAddress, block.number);
        }
        _;
    }

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
        emit Deposit(userAddress, amount);
    }

    function withdraw(
        address destination,
        uint256 amount
        )
        public forceFastForward(msg.sender)
    {
        require(users[msg.sender].unstaked - users[msg.sender].locked >= amount);
        users[msg.sender].unstaked -= amount;
        api3Token.transfer(destination, amount);
        emit Withdrawal(msg.sender, destination, amount);
    }
}
