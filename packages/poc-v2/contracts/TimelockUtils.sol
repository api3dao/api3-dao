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
        users[userAddress].unstaked += amount;
        users[userAddress].locked += amount;
        userToDepositorToTimelock[userAddress][msg.sender] = Timelock(amount, amount, releaseStart, releaseEnd);
        api3Token.transferFrom(source, address(this), amount);
    }

    // This method can simply be called from Etherscan, no need to have it on the dashboard
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
            uint256 passedTime = now - timelock.releaseStart;
            uint256 totalTime = timelock.releaseEnd - timelock.releaseStart;
            totalUnlocked = timelock.totalAmount * passedTime / totalTime;
        }
        uint256 previouslyUnlocked = timelock.totalAmount - timelock.remainingAmount;
        uint256 newlyUnlocked = totalUnlocked - previouslyUnlocked;
        users[userAddress].locked -= newlyUnlocked;
        userToDepositorToTimelock[userAddress][timelockContractAddress].remainingAmount = timelock.remainingAmount - newlyUnlocked;
    }
}
