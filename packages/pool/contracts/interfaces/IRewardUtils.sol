//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./IGetterUtils.sol";

interface IRewardUtils is IGetterUtils {
    event MintedReward(
        uint256 indexed epochIndex,
        uint256 amount,
        uint256 newApr
        );

    function mintReward()
        external;
}
