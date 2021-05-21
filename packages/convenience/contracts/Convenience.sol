//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@api3-dao/pool/contracts/Api3Pool.sol";
import "@api3-dao/api3-voting/interfaces/v0.8.4/IApi3Voting.sol";

/// @title Convenience contract used to make batch view calls to DAO contracts
contract Convenience is Ownable  {
    enum VotingAppType { Primary, Secondary }

    Api3Pool public api3Pool;
    address[] public erc20Addresses;

    constructor(address api3PoolAddress)
    {
        api3Pool = Api3Pool(api3PoolAddress);
    }

    function setErc20Addresses(address[] calldata _erc20Addresses)
        external
        onlyOwner()
    {
        erc20Addresses = _erc20Addresses;
    }

    function getTreasuries()
        external
        view
        returns (
          string[] memory names,
          string[] memory symbols,
          uint8[] memory decimals,
          uint256[] memory balancesOfPrimaryAgent,
          uint256[] memory balancesOfSecondaryAgent
        )
    {
        names = new string[](erc20Addresses.length);
        symbols = new string[](erc20Addresses.length);
        decimals = new uint8[](erc20Addresses.length);
        balancesOfPrimaryAgent = new uint256[](erc20Addresses.length);
        balancesOfSecondaryAgent = new uint256[](erc20Addresses.length);
        for (uint256 i = 0; i < erc20Addresses.length; i++)
        {
            IERC20Metadata erc20 = IERC20Metadata(erc20Addresses[i]);
            names[i] = erc20.name();
            symbols[i] = erc20.symbol();
            decimals[i] = erc20.decimals();
            balancesOfPrimaryAgent[i] = erc20.balanceOf(api3Pool.agentAppPrimary());
            balancesOfSecondaryAgent[i] = erc20.balanceOf(api3Pool.agentAppSecondary());
        }
    }

    function getDashboardData(address userAddress)
        external
        view
        returns (
            uint256 apr,
            uint256 api3Supply,
            uint256 totalStake,
            uint256 stakeTarget,
            uint256 userStaked,
            uint256 userUnstaked,
            uint256 userLocked,
            uint256 userVesting,
            uint256 userUnstakeScheduledFor,
            uint256 userUnstakeAmount // add shares
        )
    {
        apr = api3Pool.currentApr();
        api3Supply = IERC20Metadata(address(api3Pool.api3Token())).totalSupply();
        totalStake = api3Pool.totalStake();
        stakeTarget = api3Pool.stakeTarget();
        userStaked = api3Pool.userStake(userAddress);
        (
            userUnstaked,
            userVesting,
            , // unstakeShares
            userUnstakeAmount,
            userUnstakeScheduledFor,
            , // mostRecentProposalTimestamp
            , // mostRecentVoteTimestamp
            , // mostRecentDelegationTimestamp
             // mostRecentUndelegationTimestamp
            ) = api3Pool.getUser(userAddress);
        userLocked = api3Pool.getUserLocked(userAddress);
    }

    /// @dev Indexes from last, i.e., start=0, limit=5 returns the last 5 votes
    function getGovernanceData(
        VotingAppType votingAppType,
        uint256 start,
        uint256 limit
        )
        external
        view
        returns (
            uint256[] memory voteId,
            bool[] memory open,
            uint64[] memory startDate,
            uint64[] memory supportRequired,
            uint64[] memory minAcceptQuorum,
            uint256[] memory yea,
            uint256[] memory nay,
            uint256[] memory votingPower
        )
    {
        IApi3Voting api3Voting;
        if (votingAppType == VotingAppType.Primary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppPrimary());
        }
        else if (votingAppType == VotingAppType.Secondary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppSecondary());
        }
        else
        {
            revert("Invalid voting app type");
        }
        voteId = new uint256[](limit);
        open = new bool[](limit);
        startDate = new uint64[](limit);
        supportRequired = new uint64[](limit);
        minAcceptQuorum = new uint64[](limit);
        yea = new uint256[](limit);
        nay = new uint256[](limit);
        votingPower = new uint256[](limit);

        for (uint256 i = 0; i < limit; i++)
        {
            if (api3Voting.votesLength() < 1 + start + i)
            {
                break;
            }
            (
                open[i],
                , //
                startDate[i],
                , //
                supportRequired[i],
                minAcceptQuorum[i],
                yea[i],
                nay[i],
                votingPower[i],
                // 
                ) = api3Voting.getVote(api3Voting.votesLength() - 1 - start - i);
            voteId[i] = api3Voting.votesLength() - 1 - start - i;
        }
    }
}