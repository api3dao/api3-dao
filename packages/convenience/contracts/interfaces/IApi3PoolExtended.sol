//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@api3-dao/pool/contracts/interfaces/IApi3Pool.sol";

interface IApi3PoolExtended is IApi3Pool {
    function api3Token()
        external
        view
        returns (address);

    function agentAppPrimary()
        external
        view
        returns (address);

    function agentAppSecondary()
        external
        view
        returns (address);

    function votingAppPrimary()
        external
        view
        returns (address);

    function votingAppSecondary()
        external
        view
        returns (address);

    function apr()
        external
        view
        returns (uint256);

    function totalStake()
        external
        view
        returns (uint256);

    function stakeTarget()
        external
        view
        returns (uint256);

    function proposalVotingPowerThreshold()
        external
        view
        returns (uint256);
}
