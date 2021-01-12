//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";


contract RewardUtils is StakeUtils {
    constructor(address api3TokenAddress)
        StakeUtils(api3TokenAddress)
        public
    {}

    function payReward(uint256 amount)
        external
        // `onlyRewardPayer`
        // This needs to be put behind an `onlyRewardPayer` modifier because
        // each reward payment increases the gas cost of running `updateUserState()`
        // for all users
    {
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        totalStaked.push(Checkpoint(block.number, totalStakedNow + amount));
        locks.push(Checkpoint(block.number, amount));
        rewardReleases.push(Checkpoint(block.number + rewardVestingPeriod, amount));
        api3Token.transferFrom(msg.sender, address(this), amount);
    }
}