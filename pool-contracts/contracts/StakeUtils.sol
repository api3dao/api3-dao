//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./VestingUtils.sol";
import "./interfaces/IStakeUtils.sol";

/// @title Contract where the staking logic of the API3 pool is implemented
contract StakeUtils is VestingUtils, IStakeUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        VestingUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Has the user stake all of their shares
    /// @param userAddress User address
    function stake(address userAddress) public override {
        address delegate = delegates[userAddress];
        if (delegate == address(0)) {
            delegate = userAddress;
        }
        uint256 nextEpochIndex = getCurrentEpochIndex().add(1);
        // Remove previous stake
        uint256 sharesStaked = stakedAtEpoch[userAddress][nextEpochIndex];
        totalStakedAtEpoch[nextEpochIndex] = totalStakedAtEpoch[nextEpochIndex]
            .sub(sharesStaked);
        delegatedAtEpoch[delegate][nextEpochIndex] = delegatedAtEpoch[delegate][nextEpochIndex]
            .sub(sharesStaked);
        // Stake again
        uint256 sharesToStake = shares[userAddress];
        stakedAtEpoch[userAddress][nextEpochIndex] = sharesToStake;
        totalStakedAtEpoch[nextEpochIndex] = totalStakedAtEpoch[nextEpochIndex]
            .add(sharesToStake);
        delegatedAtEpoch[delegate][nextEpochIndex] = delegatedAtEpoch[delegate][nextEpochIndex]
            .add(sharesToStake);
        emit Staked(userAddress, sharesToStake);
    }

    /// @notice Has the user designate a delegate to vote on behalf of them
    /// @dev Delegate can be set to 0 or userAddress for the user to vote on
    /// their own behalf
    /// @param delegate Delegate address
    function updateDelegate(address delegate) external override {
        address userAddress = msg.sender;
        uint256 nextEpochIndex = getCurrentEpochIndex().add(1);
        // Revoke previous delegation
        address previousDelegate = delegates[userAddress];
        uint256 sharesStaked = stakedAtEpoch[userAddress][nextEpochIndex];
        delegatedAtEpoch[previousDelegate][nextEpochIndex] = delegatedAtEpoch[previousDelegate][nextEpochIndex]
            .sub(sharesStaked);
        // Apply new delegation
        delegates[userAddress] = delegate;
        delegatedAtEpoch[delegate][nextEpochIndex] = delegatedAtEpoch[delegate][nextEpochIndex]
            .add(sharesStaked);
        emit UpdatedDelegate(userAddress, delegate);
    }

    /// @notice Has the user collect rewards from the previous epoch
    /// @dev Requires the user to have staked in the two previous epoch
    /// @param userAddress User address
    function collect(address userAddress) external override {
        // Triggers the minting of inflationary rewards for this epoch if it
        // was not already. Note that this does not affect the rewards to be
        // received below, but rewards to be received in the next epoch.
        inflationManager.mintInflationaryRewardsToPool();

        uint256 currentEpochIndex = getCurrentEpochIndex();
        uint256 previousEpochIndex = currentEpochIndex.sub(1);
        uint256 twoPreviousEpochIndex = currentEpochIndex.sub(2);

            uint256 totalStakedAtPreviousEpoch
         = totalStakedAtEpoch[previousEpochIndex];

            uint256 stakedAtPreviousEpoch
         = stakedAtEpoch[userAddress][previousEpochIndex];

        // Carry over vested rewards from two epochs ago
        if (unpaidVestedRewardsAtEpoch[twoPreviousEpochIndex] != 0) {
            vestedRewardsAtEpoch[previousEpochIndex] = vestedRewardsAtEpoch[previousEpochIndex]
                .add(unpaidVestedRewardsAtEpoch[twoPreviousEpochIndex]);
            unpaidVestedRewardsAtEpoch[twoPreviousEpochIndex] = 0;
        }

        // Collect vested rewards
        uint256 vestedRewards = vestedRewardsAtEpoch[previousEpochIndex]
            .mul(totalStakedAtPreviousEpoch)
            .div(stakedAtPreviousEpoch);
        balances[userAddress] = balances[userAddress].add(vestedRewards);
        createVesting(
            userAddress,
            vestedRewards,
            currentEpochIndex.add(rewardVestingPeriod)
        );
        unpaidVestedRewardsAtEpoch[previousEpochIndex] = unpaidVestedRewardsAtEpoch[previousEpochIndex]
            .sub(vestedRewards);

        // Carry over instant rewards from two epochs ago
        if (unpaidInstantRewardsAtEpoch[twoPreviousEpochIndex] != 0) {
            instantRewardsAtEpoch[previousEpochIndex] = instantRewardsAtEpoch[previousEpochIndex]
                .add(unpaidInstantRewardsAtEpoch[twoPreviousEpochIndex]);
            unpaidInstantRewardsAtEpoch[twoPreviousEpochIndex] = 0;
        }

        // Collect instant rewards
        uint256 instantRewards = instantRewardsAtEpoch[previousEpochIndex]
            .mul(totalStakedAtPreviousEpoch)
            .div(stakedAtPreviousEpoch);
        balances[userAddress] = balances[userAddress].add(instantRewards);
        unpaidInstantRewardsAtEpoch[previousEpochIndex] = unpaidInstantRewardsAtEpoch[previousEpochIndex]
            .sub(instantRewards);
        emit Collected(userAddress, vestedRewards, instantRewards);
    }
}
