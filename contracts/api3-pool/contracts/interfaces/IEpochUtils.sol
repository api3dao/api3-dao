//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./IApi3State.sol";


interface IEpochUtils is IApi3State {
    function getCurrentEpochIndex()
        external
        view
        returns(uint256 currentEpochIndex);

    function getEpochIndex(uint256 timestamp)
        external
        view
        returns(uint256 epochIndex);
}
