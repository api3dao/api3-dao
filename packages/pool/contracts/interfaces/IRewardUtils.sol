//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

interface IRewardUtils {
    event PaidReward(
        uint256 indexed epoch,
        uint256 rewardAmount,
        uint256 apr
        );

    function payReward()
        external;

    function getUserLocked(address userAddress)
        external
        returns(uint256);
}
