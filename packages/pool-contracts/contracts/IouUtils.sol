//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./ClaimUtils.sol";
import "./interfaces/IIouUtils.sol";

/// @title Contract where the IOU logic of the API3 pool is implemented
contract IouUtils is ClaimUtils, IIouUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        ClaimUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Creates an IOU record
    /// @param userAddress User address that will receive the IOU payment if
    /// redemptionCondition is met
    /// @param amountInShares Amount that will be paid in shares if
    /// redemptionCondition is met
    /// @param claimId Claim ID
    /// @param redemptionCondition Claim status needed for payment to be made
    function createIou(
        address userAddress,
        uint256 amountInShares,
        bytes32 claimId,
        ClaimStatus redemptionCondition
    ) internal {
        bytes32 iouId = keccak256(abi.encodePacked(noIous, this));
        noIous = noIous.add(1);
        ious[iouId] = Iou({
            userAddress: userAddress,
            amountInShares: amountInShares,
            claimId: claimId,
            redemptionCondition: redemptionCondition
        });
        emit IouCreated(
            iouId,
            userAddress,
            amountInShares,
            claimId,
            redemptionCondition
        );
    }

    /// @notice Redeems an IOU
    /// @dev If the claim is finalized and redemptionCondition is not met, the
    /// IOU gets deleted without the user getting paid
    /// @param iouId IOU ID
    function redeem(bytes32 iouId) external override {
        Iou memory iou = ious[iouId];
        ClaimStatus claimStatus = claims[iou.claimId].status;
        require(claimStatus != ClaimStatus.Pending, "IOU not redeemable yet");
        if (claimStatus == iou.redemptionCondition) {
            uint256 amountInTokens = convertFromShares(iou.amountInShares);
            if (iou.redemptionCondition == ClaimStatus.Denied) {
                // While unpooling with an active claim, the user is given an
                // IOU for the amount they would pay out to the claim, and this
                // amount is left in the pool as "ghost shares" to pay out the
                // active claim if necessary. If the claim is denied and the
                // IOU is being redeemed, these ghost shares should be removed.
                totalShares = totalShares.sub(iou.amountInShares);
                totalGhostShares = totalGhostShares.sub(iou.amountInShares);
                totalPooled = totalPooled.sub(amountInTokens);
            }
            balances[iou.userAddress] = balances[iou.userAddress].add(
                amountInTokens
            );
            emit IouRedeemed(iouId, amountInTokens);
        } else {
            emit IouDeleted(iouId);
        }
        delete ious[iouId];
    }
}
