//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IApi3State {
    enum ClaimStatus {Pending, Accepted, Denied}

    event InflationManagerUpdated(address inflationManagerAddress);
    event ClaimsManagerUpdated(address claimsManagerAddress);
    event RewardVestingPeriodUpdated(uint256 rewardVestingPeriod);
    event UnpoolRequestCooldownUpdated(uint256 unpoolRequestCooldown);
    event UnpoolWaitingPeriodUpdated(uint256 unpoolWaitingPeriod);

    function updateInflationManager(address inflationManagerAddress) external;

    function updateClaimsManager(address claimsManagerAddress) external;

    function updateRewardVestingPeriod(uint256 _rewardVestingPeriod) external;

    function updateUnpoolRequestCooldown(uint256 _unpoolRequestCooldown)
        external;

    function updateUnpoolWaitingPeriod(uint256 _unpoolWaitingPeriod) external;
}
