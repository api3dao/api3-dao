//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./IGetterUtils.sol";

interface IDelegationUtils is IGetterUtils {
    event Delegated(
        address indexed user,
        address indexed delegate
        );

    event Undelegated(
        address indexed user,
        address indexed delegate
        );

    function delegateVotingPower(address delegate) 
        external;

    function undelegateVotingPower()
        external;

    
}
