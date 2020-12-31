//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

interface IInflationManager {
    event InflationaryRewardsMinted(uint256 indexed epochIndex);

    function mintInflationaryRewardsToPool() external;
}
