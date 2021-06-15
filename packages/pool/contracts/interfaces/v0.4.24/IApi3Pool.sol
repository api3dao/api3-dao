//SPDX-License-Identifier: MIT
pragma solidity 0.4.24;

/// @title A limited API3 pool contract interface to be used by Api3Voting.sol
/// in the (at)api3-dao/api3-voting package
interface IApi3Pool {
    function epochLength()
        external
        view
        returns(uint256);

    function proposalVotingPowerThreshold()
        external
        view
        returns(uint256);

    function userVotingPowerAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(uint256);

    function totalVotingPowerOneBlockAgo()
        external
        view
        returns(uint256);

    function updateLastProposalTimestamp(address userAddress)
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
            uint256 lastDelegationUpdateTimestamp,
            uint256 lastProposalTimestamp
            );

    function isGenesisEpoch()
        external
        view
        returns (bool);
}
