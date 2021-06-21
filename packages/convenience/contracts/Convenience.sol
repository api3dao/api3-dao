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
    IERC20Metadata public api3Token;

    constructor(address api3PoolAddress)
    {
        api3Pool = Api3Pool(api3PoolAddress);
        api3Token = IERC20Metadata(address(api3Pool.api3Token()));
    }

    /// @notice Called by the owner to update the addresses of the contract
    /// addresses of the ERC20 tokens that will be displayed in the treasury
    /// @dev The owner privileges here do not pose a serious security risk, the
    /// worst that can happen is that the treasury display will malfunction
    /// @param _erc20Addresses ERC20 addresses
    function setErc20Addresses(address[] calldata _erc20Addresses)
        external
        onlyOwner()
    {
        erc20Addresses = _erc20Addresses;
    }

    /// @notice Used by the DAO dashboard client to retrieve user staking data
    /// @param userAddress User address
    function getUserStakingData(address userAddress)
        external
        view
        returns (
            uint256 apr,
            uint256 api3Supply,
            uint256 totalStake,
            uint256 totalShares,
            uint256 stakeTarget,
            uint256 userApi3Balance,
            uint256 userStaked,
            uint256 userUnstaked,
            uint256 userVesting,
            uint256 userUnstakeShares,
            uint256 userUnstakeAmount,
            uint256 userUnstakeScheduledFor,
            uint256 userLocked
            )
    {
        apr = api3Pool.apr();
        api3Supply = api3Token.totalSupply();
        totalStake = api3Pool.totalStake();
        totalShares = api3Pool.totalVotingPower();
        stakeTarget = api3Pool.stakeTarget();
        userApi3Balance = api3Token.balanceOf(userAddress);
        userStaked = api3Pool.userStake(userAddress);
        (
            userUnstaked,
            userVesting,
            userUnstakeShares,
            userUnstakeAmount,
            userUnstakeScheduledFor,
            , // lastDelegationUpdateTimestamp
            // lastProposalTimestamp
            ) = api3Pool.getUser(userAddress);
        userLocked = api3Pool.userLocked(userAddress);
    }

    /// @notice Used by the DAO dashboard client to retrieve the treasury and
    /// user delegation data
    /// @param userAddress User address
    function getTreasuryAndUserDelegationData(address userAddress)
        external
        view
        returns (
            string[] memory names,
            string[] memory symbols,
            uint8[] memory decimals,
            uint256[] memory balancesOfPrimaryAgent,
            uint256[] memory balancesOfSecondaryAgent,
            uint256 proposalVotingPowerThreshold,
            uint256 userVotingPower,
            address delegate,
            uint256 lastDelegationUpdateTimestamp,
            uint256 lastProposalTimestamp
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
        proposalVotingPowerThreshold = api3Pool.proposalVotingPowerThreshold();
        userVotingPower = api3Pool.userVotingPower(userAddress);
        delegate = api3Pool.userDelegate(userAddress);   
        (
            , // unstaked
            , // vesting
            , // unstakeShares
            , // unstakeAmount
            , // unstakeScheduledFor
            lastDelegationUpdateTimestamp,
            lastProposalTimestamp
            ) = api3Pool.getUser(userAddress);
    }

    /// @notice Used by the DAO dashboard client to retrieve static vote data
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param voteIds Array of vote IDs for which data will be retrieved
    function getStaticVoteData(
        VotingAppType votingAppType,
        address userAddress,
        uint256[] calldata voteIds
        )
        external
        view
        returns (
            uint64[] memory startDate,
            uint64[] memory supportRequired,
            uint64[] memory minAcceptQuorum,
            uint256[] memory votingPower,
            bytes[] memory script,
            uint256[] memory userVotingPowerAt
            )
    {
        IApi3Voting api3Voting;
        if (votingAppType == VotingAppType.Primary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppPrimary());
        }
        else
        {
            api3Voting = IApi3Voting(api3Pool.votingAppSecondary());
        }
        startDate = new uint64[](voteIds.length);
        supportRequired = new uint64[](voteIds.length);
        minAcceptQuorum = new uint64[](voteIds.length);
        votingPower = new uint256[](voteIds.length);
        script = new bytes[](voteIds.length);
        userVotingPowerAt = new uint256[](voteIds.length);
        for (uint256 i = 0; i < voteIds.length; i++)
        {
            uint64 snapshotBlock;
            (
                , // open
                , // executed
                startDate[i],
                snapshotBlock,
                supportRequired[i],
                minAcceptQuorum[i],
                , // yea
                , // nay
                votingPower[i],
                script[i]
                ) = api3Voting.getVote(voteIds[i]);
            userVotingPowerAt[i] = api3Pool.userVotingPowerAt(userAddress, snapshotBlock);
        }
    }

    /// @notice Used by the DAO dashboard client to retrieve dynamic vote data
    /// @dev `delegateAt` is actually static but we already have to fetch it
    /// to fetch the related dynamic data so we also return it in this mtehod
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param userAddress User address
    /// @param voteIds Array of vote IDs for which data will be retrieved
    function getDynamicVoteData(
        VotingAppType votingAppType,
        address userAddress,
        uint256[] calldata voteIds
        )
        external
        view
        returns (
            bool[] memory executed,
            uint256[] memory yea,
            uint256[] memory nay,
            IApi3Voting.VoterState[] memory voterState,
            address[] memory delegateAt,
            IApi3Voting.VoterState[] memory delegateState
            )
    {
        IApi3Voting api3Voting;
        if (votingAppType == VotingAppType.Primary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppPrimary());
        }
        else
        {
            api3Voting = IApi3Voting(api3Pool.votingAppSecondary());
        }
        executed = new bool[](voteIds.length);
        yea = new uint256[](voteIds.length);
        nay = new uint256[](voteIds.length);
        voterState = new IApi3Voting.VoterState[](voteIds.length);
        delegateAt = new address[](voteIds.length);
        delegateState = new IApi3Voting.VoterState[](voteIds.length);
        for (uint256 i = 0; i < voteIds.length; i++)
        {
            uint64 snapshotBlock;
            (
                , // open
                executed[i],
                , // startDate
                snapshotBlock ,
                , // supportRequired
                , // minAcceptQuorum
                yea[i],
                nay[i],
                , // votingPower
                // script
                ) = api3Voting.getVote(voteIds[i]);
            delegateAt[i] = api3Pool.userDelegateAt(userAddress, snapshotBlock);
            if (delegateAt[i] == address(0))
            {
                voterState[i] = api3Voting.getVoterState(voteIds[i], userAddress);
            }
            else
            {
                delegateState[i] = api3Voting.getVoterState(voteIds[i], delegateAt[i]);
            }
        }
    }

    /// @notice Used by the DAO dashboard client to retrieve the IDs of the
    /// votes that are currently open
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @return voteIds Array of vote IDs for which data will be retrieved
    function getOpenVoteIds(VotingAppType votingAppType)
        external
        view
        returns (uint256[] memory voteIds)
    {
        IApi3Voting api3Voting;
        if (votingAppType == VotingAppType.Primary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppPrimary());
        }
        else
        {
            api3Voting = IApi3Voting(api3Pool.votingAppSecondary());
        }
        uint256 votesLength = api3Voting.votesLength();
        if (votesLength == 0)
        {
            return new uint256[](0);
        }
        uint256 countOpenVote = 0;
        for (uint256 i = votesLength; i > 0; i--)
        {
            (
                bool open,
                , // executed
                uint64 startDate,
                , //snapshotBlock
                , // supportRequired
                , // minAcceptQuorum
                , // yea
                , // nay
                , // votingPower
                // script
                ) = api3Voting.getVote(i - 1);
            if (open)
            {
                countOpenVote++;
            }
            if (startDate < block.timestamp - api3Voting.voteTime())
            {
                break;
            }
        }
        if (countOpenVote == 0)
        {
            return new uint256[](0);
        }
        voteIds = new uint256[](countOpenVote);
        uint256 countAddedVote = 0;
        for (uint256 i = votesLength; i > 0; i--)
        {
            if (countOpenVote == countAddedVote)
            {
                break;
            }
            (
                bool open,
                , // executed
                , // startDate
                , // snapshotBlock
                , // supportRequired
                , // minAcceptQuorum
                , // yea
                , // nay
                , // votingPower
                // script
                ) = api3Voting.getVote(i - 1);
            if (open)
            {
                voteIds[countAddedVote] = i - 1;
                countAddedVote++;
            }
        }
    }
}
