//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Api3State.sol";
import "./interfaces/IEpochUtils.sol";


/// @title Contract where the epoch logic of the API3 pool is implemented
contract EpochUtils is Api3State, IEpochUtils {
    using SafeMath for uint256;

    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
        )
        Api3State(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
            )
        public
        {}

    /// @notice Returns the index of the current epoch
    function getCurrentEpochIndex()
        public
        view
        override
        returns(uint256 currentEpochIndex)
    {
        return getEpochIndex(now);
    }

    /// @notice Returns the index of the epoch at a timestamp
    /// @dev The index of the first epoch is 1. This method returning 0 means
    /// that the epochs have not started yet.
    /// @param timestamp Timestamp
    function getEpochIndex(uint256 timestamp)
        public
        view
        override
        returns(uint256 epochIndex)
    {
        if (timestamp < firstEpochStartTimestamp)
        {
            return 0;
        }
        return timestamp.sub(firstEpochStartTimestamp).div(epochPeriodInSeconds).add(1);
    }
}
