//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./DelegationUtils.sol";

contract GetterUtils is DelegationUtils {
    constructor(address api3TokenAddress)
        DelegationUtils(api3TokenAddress)
        public
    {}

    function sharesAt(uint256 fromBlock, address userAddress)
    public view returns (uint256) {
        return getValueAt(users[userAddress].shares, fromBlock);
    }

    function shares(address userAddress)
    public view returns (uint256) {
        return sharesAt(block.number, userAddress);
    }

    function delegatedToAt(uint256 fromBlock, address userAddress)
    public view returns (uint256) {
        return getValueAt(users[userAddress].delegatedTo, fromBlock);
    }

    function delegatedTo(address userAddress)
    public view returns (uint256) {
        return delegatedToAt(block.number, userAddress);
    }

    function balanceOfAt(uint256 fromBlock, address userAddress)
    public view returns(uint256) {
        if (userDelegatingAt(userAddress, fromBlock)) {
            return 0;
        }

        uint256 userSharesThen = sharesAt(fromBlock, userAddress);
        uint256 delegatedToUserThen = delegatedToAt(fromBlock, userAddress);
        return userSharesThen.add(delegatedToUserThen);
    }

    function balanceOf(address userAddress)
    public view returns (uint256) {
        return balanceOfAt(block.number, userAddress);
    }

    function userStaked(address userAddress)
    public view returns (uint256) {
        return shares(userAddress).mul(totalStake()).div(totalSupply());
    }

    function totalSupplyAt(uint256 fromBlock)
    public view returns (uint256) {
        return getValueAt(totalShares, fromBlock);
    }

    function totalSupply()
    public view returns (uint256) {
        return totalSupplyAt(block.number);
    }

    function totalStakeAt(uint256 fromBlock)
    public view returns (uint256) {
        return getValueAt(totalStaked, fromBlock);
    }

    function totalStake()
    public view returns (uint256) {
        return totalStakeAt(block.number);
    }
}