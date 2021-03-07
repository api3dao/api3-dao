//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./ITransferUtils.sol";

interface IStakeUtils is ITransferUtils{
    event Staked(
        address indexed user,
        uint256 amount
        );

    event ScheduledUnstake(
        address indexed user,
        uint256 amount,
        uint256 scheduledFor
        );

    event Unstaked(
        address indexed user,
        uint256 amount
        );

    function stake(uint256 amount)
        external;

    function depositAndStake(
        address source,
        uint256 amount,
        address userAddress
        )
        external;

    function scheduleUnstake(uint256 amount)
        external;

    function unstake()
        external
        returns(uint256);

    function unstakeAndWithdraw(address destination)
        external;
}
