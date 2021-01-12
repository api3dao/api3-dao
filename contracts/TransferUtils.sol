//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StateUtils.sol";
import "./interfaces/IApi3Token.sol";


contract TransferUtils is StateUtils {
    IApi3Token api3Token;

    constructor(address api3TokenAddress)
        public
    {
        api3Token = IApi3Token(api3TokenAddress);
    }

    function deposit(
        address userAddress,
        uint256 amount
        )
        external
    {
        users[userAddress].unstaked += amount;
        api3Token.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(
        address destinationAddress,
        uint256 amount
        )
        external
    {
        // We have to update user state because we need the current `locked`
        updateUserState(msg.sender, block.number);
        require(users[msg.sender].unstaked - users[msg.sender].locked >= amount);
        users[msg.sender].unstaked -= amount;
        api3Token.transferFrom(address(this), destinationAddress, amount);
    }
}
