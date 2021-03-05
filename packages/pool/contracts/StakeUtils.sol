//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TransferUtils.sol";

/// @title Contract that implements the staking functionality
contract StakeUtils is TransferUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        TransferUtils(api3TokenAddress)
        public
    {}

    event Staked(
        address indexed user,
        uint256 amount
        );

    event ScheduledUnstake(
        address indexed user,
        uint256 amount,
        uint256 scheduledFor
        );

    event Unstaked(
        address indexed user,
        uint256 amount
        );

    /// @notice Called to stake tokens to receive pools in the share
    /// @param amount Amount of tokens to stake
    function stake(uint256 amount)
        public
        payEpochRewardBefore()
    {
        User storage user = users[msg.sender];
        require(user.unstaked >= amount, "Amount exceeds user deposit");
        user.unstaked = user.unstaked.sub(amount);
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 sharesToMint = totalSharesNow.mul(amount).div(totalStakedNow);
        uint256 userSharesNow = getValue(user.shares);
        user.shares.push(Checkpoint(block.number, userSharesNow.add(sharesToMint)));      
        totalShares.push(Checkpoint(block.number, totalSharesNow.add(sharesToMint)));
        totalStaked.push(Checkpoint(block.number, totalStakedNow.add(amount)));
        updateDelegatedUserShares(sharesToMint, true);
        emit Staked(msg.sender, amount);
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
    ) external {
        require(userAddress == msg.sender, "Cannot deposit and stake for others");
        deposit(source, amount, userAddress);
        stake(amount);
    }

    /// @notice Called to schedule an unstake by the user
    /// @dev Users need to schedule an unstake and wait for `unstakeWaitPeriod`
    /// to be able to unstake.
    /// Scheduling an unstake results in the reward of the current epoch to be
    /// revoked from the user. This is to prevent the user from scheduling
    /// unstakes that they are not intending to execute (to be used to evade
    /// insurance claims should they happen)
    /// @param amount Amount of tokens for which the unstake will be scheduled
    /// for 
    function scheduleUnstake(uint256 amount)
        external
        payEpochRewardBefore()
    {
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalSharesNow = getValue(totalShares);
        User storage user = users[msg.sender];
        uint256 userSharesNow = getValue(user.shares);
        require(userSharesNow.mul(totalStakedNow).div(totalSharesNow) >= amount, "Invalid amount");

        // Revoke the reward of the current epoch if applicable
        uint256 currentEpoch = now.div(epochLength);
        Reward storage currentReward = epochIndexToReward[currentEpoch];
        if (!user.epochIndexToRewardRevocationStatus[currentEpoch] && currentReward.amount != 0) {
            uint256 userSharesThen = getValueAt(user.shares, currentReward.atBlock);
            uint256 totalSharesThen = getValueAt(totalShares, currentReward.atBlock);
            uint256 tokensToRevoke = currentReward.amount.mul(userSharesThen).div(totalSharesThen);
            uint256 sharesToBurn = totalSharesNow.mul(tokensToRevoke).div(totalStakedNow);
            if (sharesToBurn > userSharesNow) {
                sharesToBurn = userSharesNow;
            }
            // The reward gets redistributed to the current stakers
            userSharesNow = userSharesNow.sub(sharesToBurn);
            totalSharesNow = totalSharesNow.sub(sharesToBurn);
            user.shares.push(Checkpoint(block.number, userSharesNow));
            totalShares.push(Checkpoint(block.number, totalSharesNow));
            updateDelegatedUserShares(sharesToBurn, false);
            // Also revert the token lock. Note that this is only an
            // approximation. The user's `locked` may be 0 here due to not
            // updating it yet, in which case this will not help (yet the
            // locked tokens will still be unlocked `rewardVestingPeriod`
            // epochs later).
            user.locked = user.locked > tokensToRevoke ? user.locked.sub(tokensToRevoke) : 0;
            user.epochIndexToRewardRevocationStatus[currentEpoch] = true;
        }
        user.unstakeScheduledFor = now.add(unstakeWaitPeriod);
        user.unstakeAmount = amount;
        emit ScheduledUnstake(msg.sender, amount, user.unstakeScheduledFor);
    }

    /// @notice Called to execute a pre-scheduled unstake
    /// @return Amount of tokens that are unstaked
    function unstake()
        public
        payEpochRewardBefore()
        returns(uint256)
    {
        User storage user = users[msg.sender];
        require(now > user.unstakeScheduledFor, "Waiting period incomplete");
        require(now < user.unstakeScheduledFor.add(epochLength), "Unstake window has expired");
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
        //The if block above prevents the following two subtractions from underflowing.
        user.shares.push(Checkpoint(block.number, userSharesNow.sub(sharesToBurn)));
        totalShares.push(Checkpoint(block.number, totalSharesNow.sub(sharesToBurn)));
        updateDelegatedUserShares(sharesToBurn, false);

        uint256 newTotalStaked = totalStakedNow > amount ? totalStakedNow.sub(amount) : 0;
        totalStaked.push(Checkpoint(block.number, newTotalStaked));
        user.unstakeScheduledFor = 0;
        user.unstakeAmount = 0;
        emit Unstaked(msg.sender, amount);
        return amount;
    }

    /// @notice Convenience method to execute an unstake and withdraw in a
    /// single transaction
    /// @param destination Token transfer destination
    function unstakeAndWithdraw(address destination)
        external
    {
        uint256 unstaked = unstake();
        withdraw(destination, unstaked);
    }
