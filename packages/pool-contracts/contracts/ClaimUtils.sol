//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./GetterUtils.sol";
import "./interfaces/IClaimUtils.sol";

/// @title Contract where the claims logic of the API3 pool is implemented
contract ClaimUtils is GetterUtils, IClaimUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        GetterUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Creates an insurance claim record
    /// @dev Can only be called by the claimsManager address
    /// @param beneficiary Address that will receive the payout upon
    /// acceptance of the claim
    /// @param amount Payout amount
    function createClaim(address beneficiary, uint256 amount)
        external
        override
        onlyClaimsManager
    {
        totalActiveClaimsAmount = totalActiveClaimsAmount.add(amount);
        require(
            getTotalRealPooled() >= totalActiveClaimsAmount,
            "Not enough funds in the collateral pool"
        );
        bytes32 claimId = keccak256(abi.encodePacked(noClaims, this));
        noClaims = noClaims.add(1);
        claims[claimId] = Claim({
            beneficiary: beneficiary,
            amount: amount,
            status: ClaimStatus.Pending
        });
        activeClaims.push(claimId);
        emit ClaimCreated(claimId, beneficiary, amount);
    }

    /// @notice Accepts an insurance claim and pays out
    /// @dev Can only be called by the claimsManager address
    /// @param claimId Claim ID
    function acceptClaim(bytes32 claimId) external override onlyClaimsManager {
        require(deactivateClaim(claimId), "No such active claim exists");
        claims[claimId].status = ClaimStatus.Accepted;
        Claim memory claim = claims[claimId];
        totalActiveClaimsAmount = totalActiveClaimsAmount.sub(claim.amount);
        totalPooled = totalPooled.sub(claim.amount);
        api3Token.transfer(claim.beneficiary, claim.amount);
        emit ClaimAccepted(claimId);
    }

    /// @notice Denies an insurance claim
    /// @dev Can only be called by the claimsManager address
    /// @param claimId Claim ID
    function denyClaim(bytes32 claimId) external override onlyClaimsManager {
        require(deactivateClaim(claimId), "No such active claim exists");
        claims[claimId].status = ClaimStatus.Denied;
        totalActiveClaimsAmount = totalActiveClaimsAmount.sub(
            claims[claimId].amount
        );
        emit ClaimDenied(claimId);
    }

    /// @notice Removes the claim from activeClaims
    /// @param claimId Claim ID
    function deactivateClaim(bytes32 claimId) private returns (bool success) {
        for (uint256 ind = 0; ind < activeClaims.length; ind++) {
            if (activeClaims[ind] == claimId) {
                activeClaims[ind] = activeClaims[activeClaims.length.sub(1)];
                activeClaims.pop();
                return true;
            }
        }
        return false;
    }

    /// @dev Reverts if the caller is not claimsManager
    modifier onlyClaimsManager() {
        require(
            msg.sender == claimsManager,
            "Caller is not the claims manager"
        );
        _;
    }
}
