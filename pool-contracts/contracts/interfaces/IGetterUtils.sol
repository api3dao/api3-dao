//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IEpochUtils.sol";

interface IGetterUtils is IEpochUtils {
    function getPooled(address userAddress)
        external
        view
        returns (uint256 pooled);

    function getVotingPower(address delegate, uint256 timestamp)
        external
        view
        returns (uint256 votingPower);

    function getTotalRealPooled()
        external
        view
        returns (uint256 totalRealPooled);

    function getBalance(address userAddress)
        external
        view
        returns (uint256 balance);

    function getShare(address userAddress)
        external
        view
        returns (uint256 share);

    function getUnpoolRequestEpoch(address userAddress)
        external
        view
        returns (uint256 unpoolRequestEpoch);

    function getTotalStaked(uint256 epochIndex)
        external
        view
        returns (uint256 totalStaked);

    function getStaked(address userAddress, uint256 epochIndex)
        external
        view
        returns (uint256 staked);

    function getDelegate(address userAddress)
        external
        view
        returns (address delegate);

    function getDelegated(address delegate, uint256 epochIndex)
        external
        view
        returns (uint256 delegated);

    function getVestedRewards(uint256 epochIndex)
        external
        view
        returns (uint256 vestedRewards);

    function getUnpaidVestedRewards(uint256 epochIndex)
        external
        view
        returns (uint256 unpaidVestedRewards);

    function getInstantRewards(uint256 epochIndex)
        external
        view
        returns (uint256 instantRewards);

    function getUnpaidInstantRewards(uint256 epochIndex)
        external
        view
        returns (uint256 unpaidInstantRewards);

    function getVesting(bytes32 vestingId)
        external
        view
        returns (
            address userAddress,
            uint256 amount,
            uint256 epoch
        );

    function getUnvestedFund(address userAddress)
        external
        view
        returns (uint256 unvestedFund);

    function getClaim(bytes32 claimId)
        external
        view
        returns (
            address beneficiary,
            uint256 amount,
            IApi3State.ClaimStatus status
        );

    function getActiveClaims()
        external
        view
        returns (bytes32[] memory _activeClaims);

    function getIou(bytes32 iouId)
        external
        view
        returns (
            address userAddress,
            uint256 amountInShares,
            bytes32 claimId,
            IApi3State.ClaimStatus redemptionCondition
        );
}
