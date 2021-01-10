//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IIouUtils.sol";

interface IVestingUtils is IIouUtils {
    event VestingCreated(
        bytes32 indexed vestingId,
        address indexed userAddress,
        uint256 amount,
        uint256 vestingEpoch
    );

    event VestingResolved(bytes32 indexed vestingId);

    function vest(bytes32 vestingId) external;
}
