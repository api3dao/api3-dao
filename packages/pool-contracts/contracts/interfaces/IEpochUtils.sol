//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IApi3State.sol";

interface IEpochUtils is IApi3State {
    function getCurrentEpochIndex()
        external
        view
        returns (uint256 currentEpochIndex);

    function getEpochIndex(uint256 timestamp)
        external
        view
        returns (uint256 epochIndex);
}
