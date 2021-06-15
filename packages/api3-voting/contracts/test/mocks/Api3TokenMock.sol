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

    uint256 public epochLength = 7 * 24 * 60 * 60;
    uint256 private mockProposalVotingPowerThreshold = 0;

    function userVotingPowerAt(address userAddress, uint256 _block)
        public
        constant
        returns (uint)
    {
        return balanceOfAt(userAddress, _block);
    }

    function proposalVotingPowerThreshold()
        external
        view
        returns(uint256)
    {
        return mockProposalVotingPowerThreshold;
    }

    function totalVotingPowerOneBlockAgo()
        external
        view
        returns(uint256)
    {
        return totalSupplyAt(block.number - 1);
    }

    function getMinterStatus(address minterAddress)
        external
        view
        returns(bool)
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
            uint256 lastDelegationUpdateTimestamp,
            uint256 lastProposalTimestamp
            )
    {
        // Return all zeros
    }

    function updateLastProposalTimestamp(address userAddress)
        external
    {
    }

    function isGenesisEpoch()
        external
        view
        returns (bool)
    {
        return false;
    }
}
