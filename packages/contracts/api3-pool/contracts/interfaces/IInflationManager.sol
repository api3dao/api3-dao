//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;


interface IInflationManager {
    event InflationaryRewardsMinted(uint256 indexed epochIndex);

    function mintInflationaryRewardsToPool()
        external;
}