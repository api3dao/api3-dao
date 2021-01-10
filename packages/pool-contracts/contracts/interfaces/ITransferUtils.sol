//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IPoolUtils.sol";

interface ITransferUtils is IPoolUtils {
    event Deposited(
        address indexed sourceAddress,
        uint256 amount,
        address indexed userAddress
    );

    event DepositedWithVesting(
        address indexed sourceAddress,
        uint256 amount,
        address indexed userAddress,
        uint256 vestingEpoch
    );

    event Withdrawn(
        address indexed userAddress,
        address destinationAddress,
        uint256 amount
    );

    event AddedVestedRewards(
        address indexed sourceAddress,
        uint256 amount,
        uint256 indexed epochIndex
    );

    event AddedInstantRewards(
        address indexed sourceAddress,
        uint256 amount,
        uint256 indexed epochIndex
    );

    function deposit(
        address sourceAddress,
        uint256 amount,
        address userAddress
    ) external;

    function depositWithVesting(
        address sourceAddress,
        uint256 amount,
        address userAddress,
        uint256 vestingStart,
        uint256 vestingEnd
    ) external;

    function withdraw(address destinationAddress, uint256 amount) external;

    function addVestedRewards(address sourceAddress, uint256 amount) external;

    function addInstantRewards(address sourceAddress, uint256 amount) external;
}
