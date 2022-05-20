//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IStakeUtils.sol";

interface IClaimUtils is IStakeUtils {
    event PaidOutClaim(
        address indexed recipient,
        uint256 amount,
        uint256 totalStake
        );

    function payOutClaim(
        address recipient,
        uint256 amount
        )
        external;
}
