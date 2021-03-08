//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IRewardUtils {
    event PaidReward(
        uint256 indexed epoch,
        uint256 rewardAmount,
        uint256 apr
        );

    function payReward()
        external;

    function getUserLockedAt(
        address userAddress,
        uint256 targetEpoch
        )
        external
        returns(uint256);

    function getUserLocked(address userAddress)
        external
        returns(uint256);
}
