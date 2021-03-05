//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./ClaimUtils.sol";


contract TimelockUtils is ClaimUtils {
    struct Timelock
    {
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 releaseStart;
        uint256 releaseEnd;
    }

    // There are two TimelockManager.sol contracts deployed at the moment. One keeps the 6 month
    // cliff, and the other keeps the linear vesting between 6–36 months. This means that there
    // will be two separate deposits made from independent contracts, and we need to distinguish
    // the two. A TimelockManager.sol only keeps a single timelock per user, so we can simply
    // keep these in a mapping here. So if a user X has timelocked tokens at contract Y, after
    // transferring them here, the record will be kept at userToDepositorToTimelock[X][Y]
    mapping(address => mapping(address => Timelock)) public userToDepositorToTimelock;

    event VestingDeposit(address indexed user, uint256 amount, uint256 start, uint256 end);
    event TimelockUpdate(address indexed user, uint256 vesting, uint256 remaining);

    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        ClaimUtils(api3TokenAddress)
        public
    {}

    // Note that this method is used by TimelockManager.sol
    function depositWithVesting(
        address source,
        uint256 amount,
        address userAddress,
        uint256 releaseStart,
        uint256 releaseEnd
        )
        external
    {
        require(userToDepositorToTimelock[userAddress][msg.sender].remainingAmount == 0);
        require(releaseEnd > releaseStart, "Invalid date range");
        require(amount != 0, "No zero amount");
        users[userAddress].unstaked = users[userAddress].unstaked.add(amount);
        users[userAddress].vesting = users[userAddress].vesting.add(amount);
        userToDepositorToTimelock[userAddress][msg.sender] = Timelock(amount, amount, releaseStart, releaseEnd);
        api3Token.transferFrom(source, address(this), amount);
        emit VestingDeposit(userAddress, amount, releaseStart, releaseEnd);
    }

    function updateTimelockStatus(
        address userAddress,
        address timelockContractAddress
        )
        external
    {
        Timelock storage timelock = userToDepositorToTimelock[userAddress][timelockContractAddress];
        uint256 totalUnlocked = 0;
        if (now >= timelock.releaseEnd)
        {
            totalUnlocked = timelock.totalAmount;
        }
        else if (now > timelock.releaseStart)
        {
            uint256 passedTime = now.sub(timelock.releaseStart);
            uint256 totalTime = timelock.releaseEnd.sub(timelock.releaseStart);
            totalUnlocked = totalTime > 0 ? timelock.totalAmount.mul(passedTime).div(totalTime) : timelock.totalAmount;
        }
        uint256 previouslyUnlocked = timelock.totalAmount.sub(timelock.remainingAmount);
        uint256 newlyUnlocked = totalUnlocked.sub(previouslyUnlocked);
        User storage user = users[userAddress];
        uint256 newUserVesting = user.vesting > newlyUnlocked ? user.vesting.sub(newlyUnlocked) : 0;
        user.vesting = newUserVesting;
        userToDepositorToTimelock[userAddress][timelockContractAddress].remainingAmount = timelock.remainingAmount.sub(newlyUnlocked);
        emit TimelockUpdate(userAddress, user.vesting, timelock.remainingAmount.sub(newlyUnlocked));
    }
}
