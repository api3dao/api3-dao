pragma solidity 0.4.24;

import "@aragon/minime/contracts/MiniMeToken.sol";


contract Api3TokenMock is MiniMeToken {
    constructor(
        MiniMeTokenFactory _tokenFactory,
        MiniMeToken _parentToken,
        uint _parentSnapShotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled
        )
        public
        MiniMeToken(
            _tokenFactory,
            _parentToken,
            _parentSnapShotBlock,
            _tokenName,
            _decimalUnits,
            _tokenSymbol,
            _transfersEnabled
            )
    {
    }

    uint256 private mockEPOCH_LENGTH = 7 * 24 * 60 * 60;

    uint256 private mockProposalVotingPowerThreshold = 0;

    function setEPOCH_LENGTH(uint256 _EPOCH_LENGTH)
        external
    {
        mockEPOCH_LENGTH = _EPOCH_LENGTH;
    }

    function setProposalVotingPowerThreshold(uint256 _proposalVotingPowerThreshold)
        external
    {
        mockProposalVotingPowerThreshold = _proposalVotingPowerThreshold;
    }

    function EPOCH_LENGTH()
        external
        view
        returns(uint256)
    {
        return mockEPOCH_LENGTH;
    }

    function proposalVotingPowerThreshold()
        external
        view
        returns(uint256)
    {
        return mockProposalVotingPowerThreshold;
    }

    function totalSupplyOneBlockAgo()
        external
        view
        returns(uint256)
    {
        return totalSupplyAt(block.number - 1);
    }

    function updateLastVoteSnapshotBlock(uint256 snapshotBlock)
        external
    {
    }

    function getMinterStatus(address account)
        external
        returns (bool)
    {
        return false;
    }

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
            )
    {
        unstaked = 0;
        vesting = 0;
        unstakeShares = 0;
        unstakeAmount = 0;
        unstakeScheduledFor = 0;
        mostRecentProposalTimestamp = 0;
        mostRecentVoteTimestamp = 0;
        mostRecentDelegationTimestamp = 0;
        mostRecentUndelegationTimestamp = 0;
    }

    function updateMostRecentProposalTimestamp(address userAddress)
        external
    {
    }

    function updateMostRecentVoteTimestamp(address userAddress)
        external
    {
    }
}
