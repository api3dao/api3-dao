//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./IDelegationUtils.sol";

interface ITransferUtils is IDelegationUtils{
    event Deposited(
        address indexed user,
        uint256 amount
        );

    event Withdrawn(
        address indexed user,
        address indexed destination,
        uint256 amount
        );

    function depositRegular(uint256 amount)
        external;

    function withdrawRegular(
        address destination,
        uint256 amount
        )
        external;
}
