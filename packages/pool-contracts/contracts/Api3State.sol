//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IApi3Token.sol";
import "./interfaces/IInflationManager.sol";
import "./interfaces/IApi3State.sol";

/// @title Contract that keeps all the state variables of the API3 pool
/// @notice The pool owner (i.e., the API3 DAO) uses this contract to update
/// parameters such as the address of the inflation manager or if the users
/// need to give a lead time before unpooling
contract Api3State is Ownable, IApi3State {
    // An insurance claim. claimsManager transfers amount number of API3 tokens
    // to beneficiary if it gets accepted.
    struct Claim {
        address beneficiary;
        uint256 amount;
        ClaimStatus status;
    }

    // An IOU given to a user that can be redeemed if the claim with claimId
    // resolves to redemptionCondition. Note that the amount that the IOU will
    // pay out is denoted in shares, rather than an absolute amount of tokens.
    struct Iou {
        address userAddress;
        uint256 amountInShares;
        bytes32 claimId;
        ClaimStatus redemptionCondition;
    }

    // A timelock that prevents the user from withdrawing amount number of API3
    // tokens from the pool contract before epoch
    struct Vesting {
        address userAddress;
        uint256 amount;
        uint256 epoch;
    }

    /// API3 token contract
    IApi3Token public immutable api3Token;
    /// A contract that mints API3 tokens every epoch and adds them to the
    /// vested rewards to be distributed in the next epoch
    IInflationManager public inflationManager;
    /// A contract that is authorized to create and resolve insurance claims
    address public claimsManager;

    // ~~~~~~Epoch~~~~~~
    /// Period that is used to quantize time for the pool functionality. The
    /// value will be 1 week=7*24*60=10080 and immutable.
    uint256 public immutable epochPeriodInSeconds;
    /// The timestamp when the first epoch is supposed to start. We have the
    /// deployer provide this value to be able to have a round number (e.g.,
    /// exactly on Thursday at 15:00 UTC), which is desirable for staking UX.
    uint256 public immutable firstEpochStartTimestamp;
    // ~~~~~~Epoch~~~~~~

    // ~~~~~~Transfer~~~~~~
    /// @dev Mapping of user addresses to balances. Includes vested and
    /// unvested funds, but not IOUs.
    mapping(address => uint256) internal balances;
    // ~~~~~~Transfer~~~~~~

    // ~~~~~~Pooling~~~~~~
    /// Total funds (i.e., API3 tokens) in the pool. Note that both this and
    /// totalShares are initialized at 1. This means that initially, 1 API3
    /// token buys 1 share.
    uint256 public totalPooled = 1;
    /// Total number of shares
    uint256 public totalShares = 1;
    /// @dev Mapping of user addresses to shares
    mapping(address => uint256) internal shares;
    /// @dev Mapping of user addresses to when they have made their last
    /// unpooling requests
    mapping(address => uint256) internal unpoolRequestEpochs;
    /// The minimum number of epochs the users have to wait to make a new
    /// unpooling request. It will be left at 0 for user convenience until the
    /// insurance functionality goes online.
    uint256 public unpoolRequestCooldown;
    /// The exact number of epochs the users have to wait to unpool after their
    /// last unpooling request. It will be left at 0 for user convenience until
    /// the insurance functionality goes online.
    uint256 public unpoolWaitingPeriod;
    // ~~~~~~Pooling~~~~~~

    // ~~~~~~Staking~~~~~~
    /// @dev Mapping of epochs to total staked shares
    mapping(uint256 => uint256) internal totalStakedAtEpoch;
    /// @dev Mapping of user addresses to mappings of epochs to staked shares
    /// of individual users
    mapping(address => mapping(uint256 => uint256)) internal stakedAtEpoch;
    /// @dev Mapping of user addresses to the addresses of their delegates. The
    /// delegate being 0 means the user is their own delegate. The same effect
    /// can be achieved by explicitly setting the delegate to be userAddress.
    mapping(address => address) internal delegates;
    /// @dev Mapping of user addresses to mappings of epochs to delegated
    /// voting power of individual users. This includes self-delegation, and is
    /// a direct representation of voting power.
    mapping(address => mapping(uint256 => uint256)) internal delegatedAtEpoch;
    /// @dev Mapping of epochs to total rewards that will be vested (e.g.,
    /// inflationary)
    mapping(uint256 => uint256) internal vestedRewardsAtEpoch;
    /// @dev Mapping of epochs to total unpaid rewards that will be vested
    /// (e.g., inflationary). Used to carry over unpaid rewards from previous
    /// epochs.
    mapping(uint256 => uint256) internal unpaidVestedRewardsAtEpoch;
    /// @dev Mapping of epochs to total rewards that will be paid out instantly
    /// (e.g., revenue distribution)
    mapping(uint256 => uint256) internal instantRewardsAtEpoch;
    /// @dev Mapping of epochs to total unpaid rewards that will be paid out
    /// instantly (e.g., revenue distribution). Used to carry over unpaid
    /// rewards from previous epochs.
    mapping(uint256 => uint256) internal unpaidInstantRewardsAtEpoch;
    /// Number of epochs the users have to wait to have rewards vested. The
    /// initial value is 1 year (52 epochs), yet this parameter is governable
    /// by the API3 DAO.
    uint256 public rewardVestingPeriod = 52;
    // ~~~~~~Staking~~~~~~

    // ~~~~~~Vesting~~~~~~
    /// @dev Number of vestings (all, not only active)
    uint256 internal noVestings;
    /// @dev Mapping of vesting IDs to vesting records
    mapping(bytes32 => Vesting) internal vestings;
    /// @dev Mapping of user addresses to their unvested funds. A user cannot
    /// withdraw an amount that will result in their balance go below their
    /// unvested funds.
    mapping(address => uint256) internal unvestedFunds;
    // ~~~~~~Vesting~~~~~~

    // ~~~~~~Claims~~~~~~
    /// @dev Number of claims (all, not only active)
    uint256 internal noClaims;
    /// @dev Mapping of claim IDs to claim records
    mapping(bytes32 => Claim) internal claims;
    /// @dev An array containing the IDs of active claims. Used to create IOUs
    /// while pooling/unpooling.
    bytes32[] internal activeClaims;
    /// Total amount claimed by the active claims. Used to determine if the
    /// pool has enough funds for a new claim.
    uint256 public totalActiveClaimsAmount;
    // ~~~~~~Claims~~~~~~

    // ~~~~~~IOUs~~~~~~
    /// @dev Number of IOUs (all, not only active)
    uint256 internal noIous;
    /// @dev Mapping of IOU IDs to IOU records
    mapping(bytes32 => Iou) internal ious;
    /// @dev Total amount of ghost shares caused by IOUs. Ghost shares can be
    /// removed upon IOU removal, and thus should be ignored while considering
    /// how much collateral the pool can provide.
    uint256 public totalGhostShares = 1;

    // ~~~~~~IOUs~~~~~~

    /// @param api3TokenAddress Address of the API3 token contract
    /// @param _epochPeriodInSeconds Length of epochs used to quantize time
    /// @param _firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 _epochPeriodInSeconds,
        uint256 _firstEpochStartTimestamp
    ) public {
        require(_epochPeriodInSeconds != 0, "Epoch period cannot be 0");
        epochPeriodInSeconds = _epochPeriodInSeconds;
        firstEpochStartTimestamp = _firstEpochStartTimestamp;
        api3Token = IApi3Token(api3TokenAddress);
    }

    /// @notice Updates the inflation manager contract to change the schedule
    /// of inflationary rewards
    /// @dev Can only be called by the owner (i.e., the API3 DAO)
    /// @param inflationManagerAddress Address of the updated inflation manager
    /// contract
    function updateInflationManager(address inflationManagerAddress)
        external
        override
        onlyOwner
    {
        inflationManager = IInflationManager(inflationManagerAddress);
        emit InflationManagerUpdated(inflationManagerAddress);
    }

    /// @notice Updates the claim manager address that is authorized to create,
    /// accept and deny insurance claims
    /// @dev Can only be called by the owner (i.e., the API3 DAO)
    /// @param claimsManagerAddress Address of the updated claims manager
    function updateClaimsManager(address claimsManagerAddress)
        external
        override
        onlyOwner
    {
        claimsManager = claimsManagerAddress;
        emit ClaimsManagerUpdated(claimsManager);
    }

    /// @notice Updates when the vested rewards (e.g., inflationary) are
    /// received
    /// @dev Can only be called by the owner (i.e., the API3 DAO)
    /// @param _rewardVestingPeriod Updated vesting period in epochs
    function updateRewardVestingPeriod(uint256 _rewardVestingPeriod)
        external
        override
        onlyOwner
    {
        rewardVestingPeriod = _rewardVestingPeriod;
        emit RewardVestingPeriodUpdated(rewardVestingPeriod);
    }

    /// @notice Updates how frequently unpooling requests can be made
    /// @dev Can only be called by the owner (i.e., the API3 DAO)
    /// @param _unpoolRequestCooldown Updated unpooling request cooldown in
    /// epochs
    function updateUnpoolRequestCooldown(uint256 _unpoolRequestCooldown)
        external
        override
        onlyOwner
    {
        unpoolRequestCooldown = _unpoolRequestCooldown;
        emit UnpoolRequestCooldownUpdated(unpoolRequestCooldown);
    }

    /// @notice Updates how long the user has to wait after making an unpool
    /// request to be able to unpool
    /// @dev Can only be called by the owner (i.e., the API3 DAO)
    /// @param _unpoolWaitingPeriod Updated unpool waiting period in epochs
    function updateUnpoolWaitingPeriod(uint256 _unpoolWaitingPeriod)
        external
        override
        onlyOwner
    {
        unpoolWaitingPeriod = _unpoolWaitingPeriod;
        emit UnpoolWaitingPeriodUpdated(unpoolWaitingPeriod);
    }
}
