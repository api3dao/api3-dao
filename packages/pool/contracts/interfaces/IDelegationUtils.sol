//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./IRewardUtils.sol";

interface IDelegationUtils is IRewardUtils {
    event Delegated(
        address indexed user,
        address indexed delegate,
        uint256 shares
        );

    event Undelegated(
        address indexed user,
        address indexed delegate,
        uint256 shares
        );

    event UpdatedDelegation(
        address indexed user,
        address indexed delegate,
        uint256 shares
        );

    function delegateVotingPower(address delegate) 
        external;

    function undelegateVotingPower()
        external;

    
}
