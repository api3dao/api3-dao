//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./IGetterUtils.sol";

interface IRewardUtils is IGetterUtils {
    event MintedReward(
        uint256 indexed epoch,
        uint256 rewardAmount,
        uint256 apr
        );

    function mintReward()
        external;
}
