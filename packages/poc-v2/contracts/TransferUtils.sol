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
        User storage user = users[msg.sender];
        if (user.lastUpdateEpoch != currentEpoch) {
            updateUserLocked(msg.sender, currentEpoch);
        }
        uint256 unlocked = user.unstaked > user.locked ? user.unstaked.sub(user.locked) : 0;
        require(unlocked >= amount, "Amount exceeds available balance");
        user.unstaked = user.unstaked.sub(amount);
        api3Token.transfer(destination, amount);
        emit Withdrawal(msg.sender, destination, amount);
    }
}
