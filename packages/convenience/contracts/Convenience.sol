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
            uint256 userStaked,
            uint256 userUnstaked,
            uint256 userLocked,
            uint256 userVesting,
            uint256 userUnstakeScheduledFor,
            uint256 userUnstakeAmount,
            uint256 userUnstakeShares
            )
    {
        apr = api3Pool.currentApr();
        api3Supply = IERC20Metadata(address(api3Pool.api3Token())).totalSupply();
        totalStake = api3Pool.totalStake();
        totalShares = api3Pool.totalSupply();
        stakeTarget = api3Pool.stakeTarget();
        userStaked = api3Pool.userStake(userAddress);
        (
            userUnstaked,
            userVesting,
            userUnstakeShares,
            userUnstakeAmount,
            userUnstakeScheduledFor,
            , // mostRecentProposalTimestamp
            , // mostRecentVoteTimestamp
            , // mostRecentDelegationTimestamp
             // mostRecentUndelegationTimestamp
            ) = api3Pool.getUser(userAddress);
        userLocked = api3Pool.getUserLocked(userAddress);
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
            address delegate,
            uint256 mostRecentProposalTimestamp,
            uint256 mostRecentVoteTimestamp,
            uint256 mostRecentDelegationTimestamp,
            uint256 mostRecentUndelegationTimestamp
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
        delegate = api3Pool.getUserDelegate(userAddress);
        (
            , // unstaked
            , // vesting
            , // unstakeShares
            , // unstakeAmount
            , // unstakeScheduledFor
            mostRecentProposalTimestamp,
            mostRecentVoteTimestamp,
            mostRecentDelegationTimestamp,
            mostRecentUndelegationTimestamp
            ) = api3Pool.getUser(userAddress);
    }

    /// @notice Used by the DAO dashboard client to retrieve general vote data
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param voteIds Array of vote IDs for which data will be retrieved
    function getGeneralVoteData(
        VotingAppType votingAppType,
        uint256[] calldata voteIds
        )
        external
        view
        returns (
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
        startDate = new uint64[](voteIds.length);
        supportRequired = new uint64[](voteIds.length);
        minAcceptQuorum = new uint64[](voteIds.length);
        yea = new uint256[](voteIds.length);
        nay = new uint256[](voteIds.length);
        votingPower = new uint256[](voteIds.length);
        for (uint256 i = 0; i < voteIds.length; i++)
        {
            (
                , // open
                , // executed
                startDate[i],
                , // snapshotBlock
                supportRequired[i],
                minAcceptQuorum[i],
                yea[i],
                nay[i],
                votingPower[i],
                // script
                ) = api3Voting.getVote(voteIds[i]);
        }
    }

    /// @notice Used by the DAO dashboard client to retrieve user vote data
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param voteIds Array of vote IDs for which data will be retrieved
    function getUserVoteData(
        VotingAppType votingAppType,
        address userAddress,
        uint256[] calldata voteIds
        )
        external
        view
        returns (
            bool[] memory executed,
            bytes[] memory script,
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
        else if (votingAppType == VotingAppType.Secondary)
        {
            api3Voting = IApi3Voting(api3Pool.votingAppSecondary());
        }
        else
        {
            revert("Invalid voting app type");
        }
        executed = new bool[](voteIds.length);
        script = new bytes[](voteIds.length);
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
                snapshotBlock,
                , // supportRequired
                , // minAcceptQuorum
                , // yea
                , // nay
                , // votingPower
                script[i]
                ) = api3Voting.getVote(voteIds[i]);
            delegateAt[i] = api3Pool.getUserDelegateAt(userAddress, snapshotBlock);
            voterState[i] = api3Voting.getVoterState(voteIds[i], userAddress);
            delegateState[i] = api3Voting.getVoterState(voteIds[i], delegateAt[i]);
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
        if (api3Voting.votesLength() == 0) {
            return ;
        }
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
        uint256 countOpenVote = 0;
        for (uint256 i = api3Voting.votesLength() - 1; i >= 0; i--)
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
                ) = api3Voting.getVote(i);
            if (open)
            {
                countOpenVote++;
            }
            if (startDate < block.timestamp - api3Voting.voteTime())
            {
                break;
            }
        }
        voteIds = new uint256[](countOpenVote);
        uint256 countAddedVote = 0;
        for (uint256 i = api3Voting.votesLength() - 1; i >= 0; i--)
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
                ) = api3Voting.getVote(i);
            if (open)
            {
                voteIds[countAddedVote] = i;
                countAddedVote++;
            }
        }
    }
}
