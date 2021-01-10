//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./TransferUtils.sol";
import "./interfaces/IApi3Pool.sol";

/// @title Contract that keeps all API3 pool functionality
/// @notice Different functions of the pool are grouped under separate
/// contracts that form a chain of inheritance. The chain goes like Api3State->
/// EpochUtils->GetterUtils->ClaimUtils->IouUtils->VestingUtils->StakeUtils->
/// PoolUtils->TransferUtils->Api3Pool. Only methods are separated and not the
/// state variables because there are some circular dependencies between these
/// functionalities.
contract Api3Pool is TransferUtils, IApi3Pool {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        TransferUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}
}
