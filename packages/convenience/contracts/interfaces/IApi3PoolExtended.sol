//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IApi3PoolExtended {
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

    function totalShares()
        external
        view
        returns (uint256);

    function userStake(address userAddress)
        external
        view
        returns (uint256);

    function getUser(address userAddress)
        external
        view
        returns (
            uint256 unstaked,
            uint256 vesting,
            uint256 unstakeShares,
            uint256 unstakeAmount,
            uint256 unstakeScheduledFor,
            uint256 lastDelegationUpdateTimestamp,
            uint256 lastProposalTimestamp
            );

    function userLocked(address userAddress)
        external
        view
        returns (uint256);

    function userVotingPowerAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns (uint256);

    function userVotingPower(address userAddress)
        external
        view
        returns (uint256);

    function delegatedToUser(address userAddress)
        external
        view
        returns (uint256);

    function userDelegateAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns (address);

    function userDelegate(address userAddress)
        external
        view
        returns (address);
}
