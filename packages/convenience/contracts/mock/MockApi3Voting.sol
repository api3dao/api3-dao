//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract MockApi3Voting  {
    struct Vote {
        bool open;
        bool executed;
        uint64 startDate;
        uint64 snapshotBlock;
        uint64 supportRequired;
        uint64 minAcceptQuorum;
        uint256 yea;
        uint256 nay;
        uint256 votingPower;
        bytes script;
    }
    Vote[] private votes;

    function addVote(
        bool open,
        bool executed,
        uint64 startDate,
        uint64 snapshotBlock,
        uint64 supportRequired,
        uint64 minAcceptQuorum,
        uint256 yea,
        uint256 nay,
        uint256 votingPower,
        bytes calldata script
        )
        external
    {
        votes.push(Vote({
            open: open,
            executed: executed,
            startDate: startDate,
            snapshotBlock: snapshotBlock,
            supportRequired: supportRequired,
            minAcceptQuorum: minAcceptQuorum,
            yea: yea,
            nay: nay,
            votingPower: votingPower,
            script: script
            }));
    }

    function votesLength()
        external
        view
        returns (uint256)
    {
        return votes.length;
    }

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
        )
    {
        require(_voteId < votes.length, "No such vote");
        open = votes[_voteId].open;
        executed = votes[_voteId].executed;
        startDate = votes[_voteId].startDate;
        snapshotBlock = votes[_voteId].snapshotBlock;
        supportRequired = votes[_voteId].supportRequired;
        minAcceptQuorum = votes[_voteId].minAcceptQuorum;
        yea = votes[_voteId].yea;
        nay = votes[_voteId].nay;
        votingPower = votes[_voteId].votingPower;
        script = votes[_voteId].script;
    }
}
