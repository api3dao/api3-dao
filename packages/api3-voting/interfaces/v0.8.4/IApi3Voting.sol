//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IApi3Voting {
     enum VoterState { Absent, Yea, Nay }

    function votesLength()
        external
        view
        returns (uint256);

    function getVote(uint256 _voteId)
        external
        view
        returns (
            bool open,
            bool executed,
            uint64 startDate,
            uint64 snapshotBlock,
            uint64 supportRequired,
            uint64 minAcceptQuorum,
            uint256 yea,
            uint256 nay,
            uint256 votingPower,
            bytes memory script
        );

    function getVoterState(uint256 _voteId, address _voter)
        external
        view
        returns (VoterState);

    function minAcceptQuorumPct()
        external
        view
        returns (uint64);

    function voteTime()
        external
        view
        returns (uint64);
}
