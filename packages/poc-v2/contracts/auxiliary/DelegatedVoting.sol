pragma solidity 0.6.12;

import "./SafeMath.sol";
import "./EnumerableSet.sol";
import "../Api3Pool.sol";

contract DelegatedVoting {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;

    Api3Pool public api3Pool;
    Voting public votingApp;

    struct Delegation {
        address delegate;
        bool active;
        uint256 updateBlock;
    }

    mapping(address => Delegation) public delegations;
    mapping(address => EnumerableSet.AddressSet) public delegates;
    mapping(address => mapping(uint256 => uint256)) delegateVotes;

    mapping(address => mapping(uint256 => string) proposalSpecUrls;

    function delegateVotingPower(address _delegate)
    external {
        require(!delegations[_delegate].active, "Cannot delegate to user who is currently delegating");
        if (_delegate == delegations[msg.sender].delegate) {
            delegations[msg.sender].active = true;
            delegations[msg.sender].updateBlock = block.number;
            return;
        }
        if (delegations[msg.sender].active) {
            delegates[delegations[msg.sender]].remove(msg.sender);
        }
        delegates[_delegate].add(msg.sender);
        delegations[msg.sender] = Delegation(_delegate, true, block.number);
    }

    function undelegateVotingPower()
    external {
        delegates[delegations[msg.sender].delegate].remove(msg.sender);
        delegations[msg.sender].active = false;
    }

    function getVotingPower(address _voter, uint256 _vote, uint256 _atBlock) 
    external {
        Delegation storage delegation_ = delegations[_voter];
        if (delegation_.active || delegation_.updateBlock > delegateVotes[delegation_.delegate][_vote]))
        {
            return 0;
        }
        uint256 power = api3Pool.balanceOfAt(_voter, _atBlock);
        if (delegates[_voter]) {
            power = power.add(getDelegatedVotingPower(_voter, _vote, _atBlock));
        }
        return power;
    }

    function getDelegatedVotingPower(address _voter, uint256 _vote, uint256 _atBlock) 
    public {
        EnumerableSet.AddressSet storage delegated_ = delegates[_voter];
        uint256 power = 0;
        for (uint256 i = 0; i < delegated_.size(); i.add(1)) {
            if(!votingApp.getVoterState(_vote, _voter)) {
                power = power.add(api3Pool.balanceOfAt(_voter, _atBlock));
            }
        }
        return power;
    }

    function provideSpecs(
        uint256 proposalNo,
        string calldata proposalSpecsUrl
        )
    external {
        votingApp.getVote(proposalNo);
        proposalSpecUrls[msg.sender][proposalNo] = proposalSpecsUrl;
    }
}