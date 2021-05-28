//SPDX-License-Identifier: MIT
pragma solidity 0.4.24;

/// @title A limited API3 pool contract interface to be used by Api3Voting.sol
/// in the (at)api3-dao/api3-voting package
interface IApi3Pool {
    function EPOCH_LENGTH()
        external
        view
        returns(uint256);

    function proposalVotingPowerThreshold()
        external
        view
        returns(uint256);

    function balanceOfAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(uint256);

    function totalSupplyOneBlockAgo()
        external
        view
        returns(uint256);

    function updateLastVoteSnapshotBlock(uint256 snapshotBlock)
        external;

    function updateMostRecentProposalTimestamp(address userAddress)
        external;

    function updateMostRecentVoteTimestamp(address userAddress)
        external;

    function getUser(address userAddress)
        external
        view
        returns(
            uint256 unstaked,
            uint256 vesting,
            uint256 unstakeShares,
            uint256 unstakeAmount,
            uint256 unstakeScheduledFor,
            uint256 mostRecentProposalTimestamp,
            uint256 mostRecentVoteTimestamp,
            uint256 mostRecentDelegationTimestamp,
            uint256 mostRecentUndelegationTimestamp
            );

    function setDaoApps(
        address _agentAppPrimary,
        address _agentAppSecondary,
        address _votingAppPrimary,
        address _votingAppSecondary
    )
    external;
}
