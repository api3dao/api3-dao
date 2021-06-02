//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./GetterUtils.sol";
import "./interfaces/IRewardUtils.sol";

/// @title Contract that implements reward payments and locks
abstract contract RewardUtils is GetterUtils, IRewardUtils {
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
                api3Token.mint(address(this), rewardAmount);
                totalStake = totalStake + rewardAmount;
                emit PaidReward(
                    currentEpoch,
                    rewardAmount,
                    currentApr
                    );
            }
            epochIndexOfLastRewardPayment = currentEpoch;
        }
    }

    /// @notice Updates the current APR
    /// @dev Called internally before paying out the reward
    function updateCurrentApr()
        internal
    {
        uint256 totalStakePercentage = totalStake
            * HUNDRED_PERCENT
            / api3Token.totalSupply();
        if (totalStakePercentage > stakeTarget) {
            currentApr = currentApr > aprUpdateStep ? currentApr - aprUpdateStep : 0;
        }
        else {
            currentApr += aprUpdateStep;
        }
        if (currentApr > maxApr) {
            currentApr = maxApr;
        }
        else if (currentApr < minApr) {
            currentApr = minApr;
        }
    }
}
