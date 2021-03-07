//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TransferUtils.sol";
import "./interfaces/IStakeUtils.sol";

/// @title Contract that implements staking functionality
contract StakeUtils is TransferUtils, IStakeUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        public
        TransferUtils(api3TokenAddress)
    {}

    /// @notice Called to stake tokens to receive pools in the share
    /// @param amount Amount of tokens to stake
    function stake(uint256 amount)
        public
        override
        payEpochRewardBefore()
    {
        User storage user = users[msg.sender];
        require(user.unstaked >= amount, ERROR_VALUE);
        user.unstaked = user.unstaked.sub(amount);
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 sharesToMint = totalSharesNow.mul(amount).div(totalStakedNow);
        uint256 userSharesNow = getValue(user.shares);
        user.shares.push(Checkpoint({
            fromBlock: block.number,
            value: userSharesNow.add(sharesToMint)
            }));      
        totalShares.push(Checkpoint({
            fromBlock: block.number,
            value: totalSharesNow.add(sharesToMint)
            }));
        totalStaked.push(Checkpoint({
            fromBlock: block.number,
            value: totalStakedNow.add(amount)
            }));
        updateDelegatedVotingPower(sharesToMint, true);
        emit Staked(
            msg.sender,
            amount
            );
    }

    /// @notice Convenience method to deposit and stake in a single transaction
    /// @dev Due to the `deposit()` interface, `userAddress` can only be the
    /// caller
    /// @param source Token transfer source
    /// @param amount Amount to be deposited and staked
    /// @param userAddress User that the tokens will be staked for
    function depositAndStake(
        address source,
        uint256 amount,
        address userAddress
        )
        external
        override
    {
        require(userAddress == msg.sender, ERROR_UNAUTHORIZED);
        deposit(source, amount, userAddress);
        stake(amount);
    }

    /// @notice Called to schedule an unstake by the user
    /// @dev Users need to schedule an unstake and wait for `unstakeWaitPeriod`
    /// to be able to unstake.
    /// Scheduling an unstake results in the reward of the current epoch to be
    /// revoked from the user. This is to prevent the user from scheduling
    /// unstakes that they are not intending to execute (to be used as a
    /// fail-safe to evade insurance claims should they happen).
    /// @param amount Amount of tokens for which the unstake will be scheduled
    /// for 
    function scheduleUnstake(uint256 amount)
        external
        override
        payEpochRewardBefore()
    {
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalSharesNow = getValue(totalShares);
        User storage user = users[msg.sender];
        uint256 userSharesNow = getValue(user.shares);
        uint256 userStakedNow = userSharesNow.mul(totalStakedNow).div(totalSharesNow);
        require(
            userStakedNow >= amount,
            ERROR_VALUE
            );

        // Revoke the reward of the current epoch if applicable
        uint256 currentEpoch = now.div(EPOCH_LENGTH);
        if (!user.epochIndexToRewardRevocationStatus[currentEpoch])
        {
            Reward storage currentReward = epochIndexToReward[currentEpoch];
            if (currentReward.amount != 0)
            {
                uint256 tokensToRevoke = currentReward.amount
                    .mul(getValueAt(user.shares, currentReward.atBlock))
                    .div(getValueAt(totalShares, currentReward.atBlock));
                uint256 sharesToBurn = (tokensToRevoke.mul(totalSharesNow)
                    .add(userSharesNow.mul(totalStakedNow))
                    .sub(userStakedNow.mul(totalSharesNow)))
                    .div(totalStakedNow.add(tokensToRevoke).sub(userStakedNow));
                if (sharesToBurn != 0)
                {
                    // Do not allow the user to burn what they are trying to
                    // unstake
                    require(sharesToBurn < userSharesNow, ERROR_UNAUTHORIZED);
                    // The reward gets redistributed to the current stakers
                    // Note that the lock for this reward will remain
                    userSharesNow = userSharesNow.sub(sharesToBurn);
                    totalSharesNow = totalSharesNow.sub(sharesToBurn);
                    user.shares.push(Checkpoint({
                        fromBlock: block.number,
                        value: userSharesNow
                        }));
                    totalShares.push(Checkpoint({
                        fromBlock: block.number,
                        value: totalSharesNow
                        }));
                    updateDelegatedVotingPower(sharesToBurn, false);
                    user.epochIndexToRewardRevocationStatus[currentEpoch] = true;
                }
            }
        }
        user.unstakeScheduledFor = now.add(unstakeWaitPeriod);
        user.unstakeAmount = amount;
        emit ScheduledUnstake(
            msg.sender,
            amount,
            user.unstakeScheduledFor
            );
    }

    /// @notice Called to execute a pre-scheduled unstake
    /// @return Amount of tokens that are unstaked
    function unstake()
        public
        override
        payEpochRewardBefore()
        returns(uint256)
    {
        User storage user = users[msg.sender];
        require(now > user.unstakeScheduledFor, ERROR_UNAUTHORIZED);
        require(now < user.unstakeScheduledFor.add(EPOCH_LENGTH), ERROR_UNAUTHORIZED);
        uint256 amount = user.unstakeAmount;
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 userSharesNow = getValue(user.shares);
        uint256 sharesToBurn = totalSharesNow.mul(amount).div(totalStakedNow);
        // If the user no longer has enough shares to unstake the scheduled
        // amount of tokens, unstake as many tokens as possible instead
        if (sharesToBurn > userSharesNow)
        {
            sharesToBurn = userSharesNow;
            amount = sharesToBurn.mul(totalStakedNow).div(totalSharesNow);
        }
        user.unstaked = user.unstaked.add(amount);
        user.shares.push(Checkpoint({
            fromBlock: block.number,
            value: userSharesNow.sub(sharesToBurn)
            }));
        totalShares.push(Checkpoint({
            fromBlock: block.number,
            value: totalSharesNow > sharesToBurn
                ? totalSharesNow.sub(sharesToBurn)
                : 1
            }));
        updateDelegatedVotingPower(sharesToBurn, false);

        uint256 newTotalStaked = totalStakedNow > amount
            ? totalStakedNow.sub(amount)
            : 1;
        totalStaked.push(Checkpoint({
            fromBlock: block.number,
            value: newTotalStaked
            }));
        user.unstakeScheduledFor = 0;
        user.unstakeAmount = 0;
        emit Unstaked(
            msg.sender,
            amount
            );
        return amount;
    }

    /// @notice Convenience method to execute an unstake and withdraw in a
    /// single transaction
    /// @dev Note that withdraw may revert because the user may have less than
    /// `unstaked` tokens that are withdrawable
    /// @param destination Token transfer destination
    function unstakeAndWithdraw(address destination)
        external
        override
    {
        uint256 unstaked = unstake();
        withdraw(destination, unstaked);
    }
}
