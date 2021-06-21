//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

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
        mintReward();
        users[msg.sender].unstaked += amount;
        // Should never return false because the API3 token uses the
        // OpenZeppelin implementation
        assert(api3Token.transferFrom(msg.sender, address(this), amount));
        emit Deposited(
            msg.sender,
            amount
            );
    }

    /// @notice Called by the user to withdraw tokens to their wallet
    /// @dev The user should call `userLocked()` beforehand to ensure that
    /// they have at least `amount` unlocked tokens to withdraw.
    /// The method is named `withdrawRegular()` to be consistent with the name
    /// `depositRegular()`. See `depositRegular()` for more context.
    /// @param amount Amount to be withdrawn
    function withdrawRegular(uint256 amount)
        public
        override
    {
        mintReward();
        withdraw(amount, userLocked(msg.sender));
    }

    /// @notice Called to calculate the locked tokens of a user by making
    /// multiple transactions
    /// @dev If the user updates their `user.shares` by staking/unstaking too
    /// frequently (50+/week) in the last `REWARD_VESTING_PERIOD`, the
    /// `userLocked()` call gas cost may exceed the block gas limit. In that
    /// case, the user may call this method multiple times to have their locked
    /// tokens calculated.
    /// @param userAddress User address
    /// @param noEpochsPerIteration Number of epochs per iteration
    /// @return finished Calculation has finished in this call
    function precalculateUserLocked(
        address userAddress,
        uint256 noEpochsPerIteration
        )
        external
        override
        returns (bool finished)
    {
        mintReward();
        require(
            noEpochsPerIteration > 0,
            "Pool: Zero iteration window"
            );
        Checkpoint[] storage _userShares = users[userAddress].shares;
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        LockedCalculation storage lockedCalculation = userToLockedCalculation[userAddress];
        // Reset the state if there was no calculation made in this epoch
        if (lockedCalculation.initialIndEpoch != currentEpoch)
        {
            lockedCalculation.initialIndEpoch = currentEpoch;
            lockedCalculation.nextIndEpoch = currentEpoch;
            lockedCalculation.locked = 0;
        }
        uint256 indEpoch = lockedCalculation.nextIndEpoch;
        uint256 locked = lockedCalculation.locked;
        uint256 oldestLockedEpoch = getOldestLockedEpoch();
        for (; indEpoch >= oldestLockedEpoch; indEpoch--)
        {
            if (lockedCalculation.nextIndEpoch >= indEpoch + noEpochsPerIteration)
            {
                lockedCalculation.nextIndEpoch = indEpoch;
                lockedCalculation.locked = locked;
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
                uint256 userSharesThen = getValueAt(_userShares, lockedReward.atBlock);
                locked += lockedReward.amount * userSharesThen / lockedReward.totalSharesThen;
            }
        }
        lockedCalculation.nextIndEpoch = indEpoch;
        lockedCalculation.locked = locked;
        emit CalculatedUserLocked(userAddress, locked);
        return true;
    }

    /// @notice Called by the user to withdraw after their locked token amount
    /// is calculated with repeated calls to `precalculateUserLocked()`
    /// @dev Only use `precalculateUserLocked()` and this method if
    /// `withdrawRegular()` hits the block gas limit
    /// @param amount Amount to be withdrawn
    function withdrawPrecalculated(uint256 amount)
        external
        override
    {
        mintReward();
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        LockedCalculation storage lockedCalculation = userToLockedCalculation[msg.sender];
        require(
            lockedCalculation.initialIndEpoch == currentEpoch,
            "Pool: Calculation not up to date"
            );
        require(
            lockedCalculation.nextIndEpoch < getOldestLockedEpoch(),
            "Pool: Calculation not complete"
            );
        withdraw(amount, lockedCalculation.locked);
    }

    /// @notice Called internally after the amount of locked tokens of the user
    /// is determined
    /// @param amount Amount to be withdrawn
    /// @param userLocked Amount of locked tokens of the user
    function withdraw(
        uint256 amount,
        uint256 userLocked
        )
        private
    {
        User storage user = users[msg.sender];
        // Check if the user has `amount` unlocked tokens to withdraw
        uint256 lockedAndVesting = userLocked + user.vesting;
        uint256 userTotalFunds = user.unstaked + userStake(msg.sender);
        require(
            userTotalFunds >= lockedAndVesting + amount,
            "Pool: Not enough unlocked funds"
            );
        require(
            user.unstaked >= amount,
            "Pool: Not enough unstaked funds"
            );
        // Carry on with the withdrawal
        user.unstaked -= amount;
        // Should never return false because the API3 token uses the
        // OpenZeppelin implementation
        assert(api3Token.transfer(msg.sender, amount));
        emit Withdrawn(
            msg.sender,
            amount
            );
    }
}
