//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IGetterUtils.sol";

interface IClaimUtils is IGetterUtils {
    event ClaimCreated(
        bytes32 indexed claimId,
        address indexed beneficiary,
        uint256 amount
    );

    event ClaimAccepted(bytes32 indexed claimId);

    event ClaimDenied(bytes32 indexed claimId);

    function createClaim(address beneficiary, uint256 amount) external;

    function acceptClaim(bytes32 claimId) external;

    function denyClaim(bytes32 claimId) external;
}
