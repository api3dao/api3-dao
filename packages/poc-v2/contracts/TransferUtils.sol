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

    // Note that this method is used by TimelockManager.sol
    function deposit(
        address source,
        uint256 amount,
        address userAddress
        )
    public
    {
        users[userAddress].unstaked = users[userAddress].unstaked.add(amount);
        api3Token.transferFrom(source, address(this), amount);
        emit Deposit(userAddress, amount);
    }

    function withdraw(address destination, uint256 amount)
    public
    {
        uint256 currentEpoch = now.div(rewardEpochLength);
        if(users[msg.sender].lastUpdateEpoch != currentEpoch) {
            updateUserLock(msg.sender, currentEpoch);
        }
        require(users[msg.sender].unstaked.sub(users[msg.sender].locked) >= amount, 
        "Amount exceeds available balance");
        users[msg.sender].unstaked = users[msg.sender].unstaked.sub(amount);
        api3Token.transfer(destination, amount);
        emit Withdrawal(msg.sender, destination, amount);
    }
}
