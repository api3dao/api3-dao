//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./GetterUtils.sol";
import "./interfaces/IRewardUtils.sol";

/// @title Contract that implements reward payments and locks
contract RewardUtils is GetterUtils, IRewardUtils {
    /// @dev Pays the epoch reward before the modified function
    modifier payEpochRewardBefore {
        payReward();
        _;
    }

    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        GetterUtils(api3TokenAddress)
    {}

    /// @notice Updates the current APR
    /// @dev Called internally before paying out the reward
    function updateCurrentApr()
        internal
    {
        if (stakeTarget == 0) {
            currentApr = minApr;
            return;
        }
        uint256 totalStakePercentage = totalStake
             * HUNDRED_PERCENT
            / api3Token.totalSupply();
        // Calculate what % we are off from the target
        uint256 deltaAbsolute = totalStakePercentage < stakeTarget 
            ? stakeTarget - totalStakePercentage
            : totalStakePercentage - stakeTarget;
        uint256 deltaPercentage = deltaAbsolute * HUNDRED_PERCENT / stakeTarget;
        // Use the update coefficient to calculate what % we need to update
        // the APR with
        uint256 aprUpdate = deltaPercentage * aprUpdateCoefficient / ONE_PERCENT;

        uint256 newApr;
        if (totalStakePercentage < stakeTarget) {
            newApr = currentApr * (HUNDRED_PERCENT + aprUpdate) / HUNDRED_PERCENT;
        }
        else {
            newApr = HUNDRED_PERCENT > aprUpdate
                ? currentApr * (HUNDRED_PERCENT - aprUpdate) / HUNDRED_PERCENT
                : 0;
        }

        if (newApr < minApr) {
            currentApr = minApr;
        }
        else if (newApr > maxApr) {
            currentApr = maxApr;
        }
        else {
            currentApr = newApr;
        }
    }

    /// @notice Called to pay the reward for the current epoch
    /// @dev Skips past epochs for which rewards have not been paid for.
    /// Skips the reward payment if the pool is not authorized to mint tokens.
    /// Neither of these conditions will occur in practice.
    function payReward()
        public
        override
    {
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        // This will be skipped in most cases because someone else will have
        // triggered the payment for this epoch
        if (epochIndexOfLastRewardPayment < currentEpoch)
        {
            if (api3Token.getMinterStatus(address(this)))
            {
                updateCurrentApr();
                uint256 rewardAmount = totalStake * currentApr / REWARD_VESTING_PERIOD / HUNDRED_PERCENT;
                epochIndexToReward[currentEpoch] = Reward({
                    atBlock: block.number,
                    amount: rewardAmount,
                    totalSharesThen: totalShares()
                    });
                if (rewardAmount > 0) {
                    api3Token.mint(address(this), rewardAmount);
                    totalStake = totalStake + rewardAmount;
                }
                emit PaidReward(
                    currentEpoch,
                    rewardAmount,
                    currentApr
                    );
            }
            epochIndexOfLastRewardPayment = currentEpoch;
        }
    }

    /// @notice Called to get the locked tokens of the user at a specific epoch
    /// @param userAddress User address
    /// @param targetEpoch Epoch index for which the locked tokens will be
    /// returned
    /// @return Locked tokens of the user at the epoch
    function getUserLockedAt(
        address userAddress,
        uint256 targetEpoch
        )
        public
        override
        payEpochRewardBefore()
        returns(uint256)
    {
        User storage user = users[userAddress];
        uint256 oldestLockedEpoch = targetEpoch - REWARD_VESTING_PERIOD > genesisEpoch
            ? targetEpoch - REWARD_VESTING_PERIOD + 1
            : genesisEpoch + 1;
        uint256 locked = 0;
        for (
                uint256 ind = oldestLockedEpoch;
                ind <= targetEpoch;
                ind = ind + 1
            )
        {
            Reward storage lockedReward = epochIndexToReward[ind];
            if (lockedReward.atBlock != 0)
            {
                uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
                locked = locked + (lockedReward.amount * userSharesThen / lockedReward.totalSharesThen);
            }
        }
        return locked;
    }

    /// @notice Called to get the current locked tokens of the user
    /// @dev This can be called statically by clients (e.g., the DAO dashboard)
    /// to get the locked tokens of the user without actually updating it
    /// @param userAddress User address
    /// @return Current locked tokens of the user
    function getUserLocked(address userAddress)
        public
        override
        returns(uint256)
    {
        return getUserLockedAt(userAddress, block.timestamp / EPOCH_LENGTH);
    }
}
