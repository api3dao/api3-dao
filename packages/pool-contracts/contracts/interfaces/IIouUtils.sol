//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IApi3State.sol";
import "./IClaimUtils.sol";

interface IIouUtils is IClaimUtils {
    event IouCreated(
        bytes32 indexed iouId,
        address indexed userAddress,
        uint256 amountInShares,
        bytes32 indexed claimId,
        IApi3State.ClaimStatus redemptionCondition
    );

    event IouRedeemed(bytes32 indexed iouId, uint256 amount);

    event IouDeleted(bytes32 indexed iouId);

    function redeem(bytes32 iouId) external;
}
