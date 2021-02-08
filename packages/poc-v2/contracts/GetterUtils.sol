//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StateUtils.sol";

contract GetterUtils is StateUtils {
    constructor(address api3TokenAddress)
        StateUtils(api3TokenAddress)
        public
    {}

    function balanceOfAt(uint256 fromBlock,address userAddress)
    external view returns(uint256)
    {
        return getValueAt(users[userAddress].shares, fromBlock);
    }

    function balanceOf(address userAddress)
    external view returns (uint256) {
        return this.balanceOfAt(block.number, userAddress);
    }

    function totalSupplyAt(uint256 fromBlock)
    external view returns (uint256) {
        return getValueAt(totalShares, fromBlock);
    }

    function totalSupply()
    external view returns (uint256) {
        return this.totalSupplyAt(block.number);
    }

    function totalStakeAt(uint256 fromBlock)
    external view returns (uint256) {
        return getValueAt(totalStaked, fromBlock);
    }

    function totalStake()
    external view returns (uint256) {
        return this.totalStakeAt(block.number);
    }
}