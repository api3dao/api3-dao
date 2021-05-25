//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./DelegationUtils.sol";
import "./interfaces/ITransferUtils.sol";

/// @title Contract that implements token transfer functionality
abstract contract TransferUtils is DelegationUtils, ITransferUtils {
    /// @notice Called by the user to deposit tokens
    /// @dev The user should approve the pool to spend at least `amount` tokens
    /// before calling this.
    /// The method is named `depositRegular()` to prevent potential confusion
    /// (for example it is difficult to differentiate overloaded functions in
    /// JS). See `deposit()` for more context.
    /// @param amount Amount to be deposited
    function depositRegular(uint256 amount)
        public
        override
    {
        payReward();
        users[msg.sender].unstaked = users[msg.sender].unstaked + amount;
        api3Token.transferFrom(msg.sender, address(this), amount);
        emit Deposited(
            msg.sender,
            amount
            );
    }

    /// @notice Called by the user to withdraw tokens
    /// @dev The user should call `getUserLocked()` beforehand to ensure that
    /// they have at least `amount` unlocked tokens to withdraw.
    /// The method is named `withdrawRegular()` to be consistent with the name
    /// `depositRegular()`. See `depositRegular()` for more context.
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    function withdrawRegular(
        address destination,
        uint256 amount
        )
        public
        override
    {
        payReward();
        uint256 userLocked = getUserLocked(msg.sender);
        withdraw(destination, amount, userLocked);
    }

    /// @notice Called to calculate the locked tokens of a user by making
    /// multiple transactions
    /// @dev If the user updates their `user.shares` by staking/unstaking too
    /// frequently (50+/week) in the last `REWARD_VESTING_PERIOD`, the
    /// `getUserLocked()` call gas cost may exceed the block gas limit. In that
    /// case, the user may call this method multiple times to have their locked
    /// tokens calculated.
    /// @param userAddress User address
    /// @param noEpochsPerIteration Number of epochs per iteration
    /// @return finished Calculation has finished in this call
    function calculateUserLockedIteratively(
        address userAddress,
        uint256 noEpochsPerIteration
        )
        external
        override
        returns (bool finished)
    {
        require(noEpochsPerIteration > 0, "Iteration window invalid");
        payReward();
        Checkpoint[] storage _userShares = users[userAddress].shares;
        uint256 userSharesLength = _userShares.length;
        require(userSharesLength != 0, "User never had shares");
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        LockedCalculationState storage state = userToLockedCalculationState[userAddress];
        // Reset the state if there was no calculation made in this epoch
        if (state.initialIndEpoch != currentEpoch)
        {
            state.initialIndEpoch = currentEpoch;
            state.nextIndEpoch = currentEpoch;
            state.locked = 0;
        }
        uint256 indEpoch = state.nextIndEpoch;
        uint256 locked = state.locked;
        uint256 oldestLockedEpoch = currentEpoch - REWARD_VESTING_PERIOD > genesisEpoch
            ? currentEpoch - REWARD_VESTING_PERIOD + 1
            : genesisEpoch + 1;
        for (; indEpoch >= oldestLockedEpoch; indEpoch--)
        {
            if (state.nextIndEpoch >= indEpoch + noEpochsPerIteration)
            {
                state.nextIndEpoch = indEpoch;
                state.locked = locked;
                emit CalculatingUserLocked(
                    userAddress,
                    indEpoch,
                    oldestLockedEpoch
                    );
                return false;
            }
            Reward storage lockedReward = epochIndexToReward[indEpoch];
            if (lockedReward.atBlock != 0)
            {
                uint256 userSharesThen = getValueAtWithBinarySearch(_userShares, lockedReward.atBlock);
                locked = locked + (lockedReward.amount * userSharesThen / lockedReward.totalSharesThen);
            }
        }
        state.nextIndEpoch = indEpoch;
        state.locked = locked;
        emit CalculatedUserLocked(userAddress, locked);
        return true;
    }

    /// @notice Called by the user to withdraw after their locked token amount
    /// is calculated with repeated calls to `calculateUserLockedIteratively()`
    /// @dev Only use `calculateUserLockedIteratively()` and this method if
    /// `withdrawRegular()` hits the block gas limit
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    function withdrawWithPrecalculatedLocked(
        address destination,
        uint256 amount
        )
        external
        override
    {
        payReward();
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        LockedCalculationState storage state = userToLockedCalculationState[msg.sender];
        require(state.initialIndEpoch == currentEpoch, "Locked amount not precalculated");
        withdraw(destination, amount, state.locked);
    }

    /// @notice Called internally after the amount of locked tokens of the user
    /// is determined
    /// @param destination Token transfer destination
    /// @param amount Amount to be withdrawn
    /// @param userLocked Amount of locked tokens of the user
    function withdraw(
        address destination,
        uint256 amount,
        uint256 userLocked
        )
        private
    {
        User storage user = users[msg.sender];
        // Check if the user has `amount` unlocked tokens to withdraw
        uint256 lockedAndVesting = userLocked + user.vesting;
        uint256 userTotalFunds = user.unstaked + userStake(msg.sender);
        require(userTotalFunds >= lockedAndVesting + amount, ERROR_VALUE);
        // Carry on with the withdrawal
        require(user.unstaked >= amount, ERROR_VALUE);
        user.unstaked = user.unstaked - amount;
        api3Token.transfer(destination, amount);
        emit Withdrawn(
            msg.sender,
            destination,
            amount
            );
    }
}
