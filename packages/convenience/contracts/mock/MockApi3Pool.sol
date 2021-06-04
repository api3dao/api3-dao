//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract MockApi3Pool  {
    address public votingAppPrimary;
    address public votingAppSecondary;

    function setDaoApps(
        address _votingAppPrimary,
        address _votingAppSecondary
        )
        external
    {
        votingAppPrimary = _votingAppPrimary;
        votingAppSecondary = _votingAppSecondary;
    }
}