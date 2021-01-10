//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./EpochUtils.sol";
import "./interfaces/IGetterUtils.sol";

/// @title Contract where getters and some convenience methods are implemented
/// for the API3 pool
contract GetterUtils is EpochUtils, IGetterUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        EpochUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Returns the amount of funds the user has pooled
    /// @param userAddress User address
    function getPooled(address userAddress)
        public
        override
        view
        returns (uint256 pooled)
    {
        pooled = shares[userAddress].mul(totalPooled).div(totalShares);
    }

    /// @notice Calculates how many shares an amount of tokens corresponds to
    /// @param amount Amount of funds
    function convertToShares(uint256 amount)
        internal
        view
        returns (uint256 amountInShares)
    {
        amountInShares = amount.mul(totalShares).div(totalPooled);
    }

    /// @notice Calculates how many tokens an amount of shares corresponds to
    /// @param amountInShares Amount in shares
    function convertFromShares(uint256 amountInShares)
        internal
        view
        returns (uint256 amount)
    {
        amount = amountInShares.mul(totalPooled).div(totalShares);
    }

    /// @notice Returns the amount of voting power a delegate has at a given
    /// timestamp
    /// @dev Total voting power of all delegates adds up to 1e18
    /// @param delegate Delegate address
    /// @param timestamp Timestamp
    function getVotingPower(address delegate, uint256 timestamp)
        external
        override
        view
        returns (uint256 votingPower)
    {
        uint256 epochIndex = getEpochIndex(timestamp);
        votingPower = delegatedAtEpoch[delegate][epochIndex].mul(1e18).div(
            totalStakedAtEpoch[epochIndex]
        );
    }

    /// @notice Returns the total pooled funds minus ghost funds. This is
    /// needed because ghost funds may be removed as IOUs are redeemed, and
    /// thus cannot be considered as collateral reliably.
    /// @return totalRealPooled Total pooled funds minus ghost funds
    function getTotalRealPooled()
        public
        override
        view
        returns (uint256 totalRealPooled)
    {
        totalRealPooled = totalPooled.sub(convertFromShares(totalGhostShares));
    }

    /// @notice Returns the user balance. Includes vested and uvested funds,
    /// but not IOUs.
    /// @param userAddress User address
    /// @return balance User balance
    function getBalance(address userAddress)
        external
        override
        view
        returns (uint256 balance)
    {
        balance = balances[userAddress];
    }

    /// @notice Returns the number of shares the user has pooled
    /// @param userAddress User address
    /// @return share Number of shares
    function getShare(address userAddress)
        external
        override
        view
        returns (uint256 share)
    {
        share = shares[userAddress];
    }

    /// @notice Returns the epoch when the user has made their last unpooling
    /// request
    /// @param userAddress User address
    /// @return unpoolRequestEpoch The epoch when the user has made their last
    /// unpooling request
    function getUnpoolRequestEpoch(address userAddress)
        external
        override
        view
        returns (uint256 unpoolRequestEpoch)
    {
        unpoolRequestEpoch = unpoolRequestEpochs[userAddress];
    }

    /// @notice Returns the total number of shares staked at epochIndex
    /// @param epochIndex Epoch index
    /// @return totalStaked Total number of shares staked
    function getTotalStaked(uint256 epochIndex)
        external
        override
        view
        returns (uint256 totalStaked)
    {
        totalStaked = totalStakedAtEpoch[epochIndex];
    }

    /// @notice Returns the total number of shares the user has staked at
    /// epochIndex
    /// @param userAddress User address
    /// @param epochIndex Epoch index
    /// @return staked Number of shares the user has staked
    function getStaked(address userAddress, uint256 epochIndex)
        external
        override
        view
        returns (uint256 staked)
    {
        staked = stakedAtEpoch[userAddress][epochIndex];
    }

    /// @notice Returns the delegate of the user
    /// @dev 0 being returned means the user is their own delegate
    /// @param userAddress User address
    /// @return delegate The address that will vote on behalf of the user
    function getDelegate(address userAddress)
        external
        override
        view
        returns (address delegate)
    {
        delegate = delegates[userAddress];
    }

    /// @notice Returns the delegated voting power of the delegate
    /// @param delegate Delegate address
    /// @param epochIndex Epoch index
    /// @return delegated Delegated voting power
    function getDelegated(address delegate, uint256 epochIndex)
        external
        override
        view
        returns (uint256 delegated)
    {
        delegated = delegatedAtEpoch[delegate][epochIndex];
    }

    /// @notice Returns the vested rewards that will be distributed at
    /// epochIndex
    /// @param epochIndex Epoch index
    /// @return vestedRewards Vested rewards
    function getVestedRewards(uint256 epochIndex)
        external
        override
        view
        returns (uint256 vestedRewards)
    {
        vestedRewards = vestedRewardsAtEpoch[epochIndex];
    }

    /// @notice Returns the vested rewards that has not been distributed at
    /// epochIndex yet
    /// @param epochIndex Epoch index
    /// @return unpaidVestedRewards Unpaid vested rewards
    function getUnpaidVestedRewards(uint256 epochIndex)
        external
        override
        view
        returns (uint256 unpaidVestedRewards)
    {
        unpaidVestedRewards = unpaidVestedRewardsAtEpoch[epochIndex];
    }

    /// @notice Returns the instant rewards that will be distributed at
    /// epochIndex
    /// @param epochIndex Epoch index
    /// @return instantRewards Instant rewards
    function getInstantRewards(uint256 epochIndex)
        external
        override
        view
        returns (uint256 instantRewards)
    {
        instantRewards = instantRewardsAtEpoch[epochIndex];
    }

    /// @notice Returns the instant rewards that has not been distributed at
    /// epochIndex yet
    /// @param epochIndex Epoch index
    /// @return unpaidInstantRewards Unpaid instant rewards
    function getUnpaidInstantRewards(uint256 epochIndex)
        external
        override
        view
        returns (uint256 unpaidInstantRewards)
    {
        unpaidInstantRewards = unpaidInstantRewardsAtEpoch[epochIndex];
    }

    /// @notice Returns the vesting
    /// @param vestingId Vesting ID
    /// @return userAddress User address
    /// @return amount Number of tokens to be vested
    /// @return epoch Index of the epoch when the funds will be
    /// available
    function getVesting(bytes32 vestingId)
        external
        override
        view
        returns (
            address userAddress,
            uint256 amount,
            uint256 epoch
        )
    {
        Vesting memory vesting = vestings[vestingId];
        userAddress = vesting.userAddress;
        amount = vesting.amount;
        epoch = vesting.epoch;
    }

    /// @notice Returns the total funds of the user locked by vestings
    /// @param userAddress User address
    /// @return unvestedFund Total funds of the user locked by vestings
    function getUnvestedFund(address userAddress)
        external
        override
        view
        returns (uint256 unvestedFund)
    {
        unvestedFund = unvestedFunds[userAddress];
    }

    /// @notice Returns the claim
    /// @param claimId Claim ID
    /// @return beneficiary Address that will receive the payout upon
    /// acceptance of the claim
    /// @return amount Payout amount
    /// @return status Claim status
    function getClaim(bytes32 claimId)
        external
        override
        view
        returns (
            address beneficiary,
            uint256 amount,
            ClaimStatus status
        )
    {
        Claim memory claim = claims[claimId];
        beneficiary = claim.beneficiary;
        amount = claim.amount;
        status = claim.status;
    }

    /// @notice Returns the array of active claim IDs
    /// @return _activeClaims Array of active claim IDs
    function getActiveClaims()
        external
        override
        view
        returns (bytes32[] memory _activeClaims)
    {
        _activeClaims = activeClaims;
    }

    /// @notice Returns the IOU
    /// @param iouId IOU ID
    /// @return userAddress User address that will receive the IOU payment if
    /// redemptionCondition is met
    /// @return amountInShares Amount that will be paid in shares if
    /// redemptionCondition is met
    /// @return claimId Claim ID
    /// @return redemptionCondition Claim status needed for payment to be made
    function getIou(bytes32 iouId)
        external
        override
        view
        returns (
            address userAddress,
            uint256 amountInShares,
            bytes32 claimId,
            ClaimStatus redemptionCondition
        )
    {
        Iou memory iou = ious[iouId];
        userAddress = iou.userAddress;
        amountInShares = iou.amountInShares;
        claimId = iou.claimId;
        redemptionCondition = iou.redemptionCondition;
    }
}
