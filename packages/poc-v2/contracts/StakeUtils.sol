//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TransferUtils.sol";
import "hardhat/console.sol";

contract StakeUtils is TransferUtils {
    constructor(address api3TokenAddress)
        TransferUtils(api3TokenAddress)
        public
    {}

    event Stake(address indexed user, uint256 amount);
    event ScheduleUnstake(address indexed user, uint256 amount, uint256 scheduledFor);
    event Unstake(address indexed user, uint256 amount);
    
    function stake(uint256 amount)
        public triggerEpochBefore
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
        emit Stake(msg.sender, amount);
    }

    function depositAndStake(
        address source,
        uint256 amount,
        address userAddress
    ) external {
        deposit(source, amount, userAddress);
        stake(amount);
    }

    function scheduleUnstake(uint256 amount)
        external
    {
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalSharesNow = getValue(totalShares);
        User storage user = users[msg.sender];
        uint256 userSharesNow = getValue(user.shares);

        // Revoke this epoch's reward if we haven't already
        uint256 current = now.div(rewardEpochLength);
        uint256 tokensToRevoke = 0;
        if (!user.revokedEpochReward[current] && rewards[current].amount != 0) {
            RewardEpoch storage currentEpoch = rewards[current];
            uint256 userSharesThen = getValueAt(user.shares, currentEpoch.atBlock);
            uint256 totalSharesThen = getValueAt(totalShares, currentEpoch.atBlock);

            tokensToRevoke = currentEpoch.amount.mul(userSharesThen).div(totalSharesThen);
            uint256 sharesToBurn = totalSharesNow.mul(tokensToRevoke).div(totalStakedNow);
            if (sharesToBurn > userSharesNow) {
                sharesToBurn = userSharesNow;
            }

            userSharesNow = userSharesNow.sub(sharesToBurn);
            totalSharesNow = totalSharesNow.sub(sharesToBurn);
            user.shares.push(Checkpoint(block.number, userSharesNow));
            totalShares.push(Checkpoint(block.number, totalSharesNow));
            
            user.locked = user.locked > tokensToRevoke ? user.locked.sub(tokensToRevoke) : 0;
            user.revokedEpochReward[current] = true;
        }
        uint256 userStakedNow = userSharesNow.mul(totalStakedNow).div(totalSharesNow);
        require(amount <= userStakedNow.add(tokensToRevoke), "Insufficient amount");
        user.unstakeScheduledFor = now.add(unstakeWaitPeriod);
        user.unstakeAmount = amount;
        emit ScheduleUnstake(msg.sender, amount, user.unstakeScheduledFor);
    }

    function unstake()
        public triggerEpochBefore returns (uint256)
    {
        User storage user = users[msg.sender];
        require(now > user.unstakeScheduledFor, "Waiting period incomplete");
        require(now < user.unstakeScheduledFor.add(rewardEpochLength), "Unstake window has expired");
        uint256 amount = user.unstakeAmount;
        uint256 totalSharesNow = getValue(totalShares);
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 userSharesNow = getValue(user.shares);
        uint256 sharesToBurn = totalSharesNow.mul(amount).div(totalStakedNow);
        if (sharesToBurn > userSharesNow)
        {
            sharesToBurn = userSharesNow;
            amount = sharesToBurn.mul(totalStakedNow).div(totalSharesNow);
        }
        user.unstaked = user.unstaked.add(amount);
        user.shares.push(Checkpoint(block.number, userSharesNow.sub(sharesToBurn)));
        totalShares.push(Checkpoint(block.number, totalSharesNow.sub(sharesToBurn)));
        totalStaked.push(Checkpoint(block.number, totalStakedNow.sub(amount)));
        user.unstakeScheduledFor = 0;
        user.unstakeAmount = 0;
        emit Unstake(msg.sender, amount);
        return amount;
    }

    function unstakeAndWithdraw(address destination) external {
        uint256 unstaked = unstake();
        withdraw(destination, unstaked);
    }
}