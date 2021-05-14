//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

/// @title A limited API3 pool contract interface to be used by
/// TimelockManager.sol
interface IApi3Pool {
    function deposit(
        address source,
        uint256 amount,
        address userAddress
        )
        external;

    function depositWithVesting(
        address source,
        uint256 amount,
        address userAddress,
        uint256 releaseStart,
        uint256 releaseEnd
        )
        external;
}
