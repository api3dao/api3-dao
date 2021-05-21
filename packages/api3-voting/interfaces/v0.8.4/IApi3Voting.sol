//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IApi3Voting {
    function votesLength()
        external
        view
        returns(uint256);

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

    function getVoteMetadata(uint256 _voteId)
        external
        view
        returns (string memory metadata);
}
