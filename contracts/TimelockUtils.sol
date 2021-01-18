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

    mapping(address => Timelock[]) public userTimelocks;

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
        users[userAddress].unstaked += amount;
        users[userAddress].locked += amount;
        userTimelocks[userAddress].push(Timelock(amount, amount, releaseStart, releaseEnd));
        api3Token.transferFrom(source, address(this), amount);
    }

    // This method can simply be called from Etherscan, no need to have it on the dashboard
    function updateTimelockStatus(
        address userAddress,
        uint256 indTimelock
        )
        external
    {
        Timelock storage timelock = userTimelocks[userAddress][indTimelock];
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
