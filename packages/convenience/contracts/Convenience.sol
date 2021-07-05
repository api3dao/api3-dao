//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@api3-dao/api3-voting/interfaces/v0.8.4/IApi3Voting.sol";
import "./interfaces/IApi3PoolExtended.sol";


/// @title Convenience contract used to make batch view calls to DAO contracts
contract Convenience is Ownable  {
    enum VotingAppType { Primary, Secondary }

    /// @notice Governance token of the DAO
    IERC20Metadata public immutable api3Token;
    /// @notice Staking pool of the DAO
    IApi3PoolExtended public immutable api3Pool;
    /// @notice List of ERC20 addresses that will be displayed in the DAO
    /// treasury. The ETH balance will also be displayed by default.
    /// @dev These are set by the owner of this contract
    address[] public erc20Addresses;
    /// @notice Links to the discussion venues for each vote
    /// @dev These are set by the owner of this contract, for example by
    /// running a bot that automatically creates a forum thread with the vote
    /// type and ID and writes its URL to the chain
    mapping(VotingAppType => mapping(uint256 => string)) public votingAppTypeToVoteIdToDiscussionUrl;

    event SetErc20Addresses(address[] erc20Addresses);

    event SetDiscussionUrl(
        VotingAppType indexed votingAppType,
        uint256 indexed voteId,
        string discussionUrl
        );

    /// @param api3PoolAddress Staking pool address of the DAO 
    constructor(address api3PoolAddress)
    {
        api3Pool = IApi3PoolExtended(api3PoolAddress);
        api3Token = IERC20Metadata(address(IApi3PoolExtended(api3PoolAddress).api3Token()));
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
        emit SetErc20Addresses(_erc20Addresses);
    }

    /// @notice Called by the owner to update the discussion URL of a specific
    /// vote to be displayed on the DAO dashboard
    /// @dev The owner privileges here do not pose a serious security risk, the
    /// worst that can happen is that the discussion URL will malfunction
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param voteId Vote ID for which discussion URL will be updated
    /// @param discussionUrl Discussion URL
    function setDiscussionUrl(
        VotingAppType votingAppType,
        uint256 voteId,
        string calldata discussionUrl
        )
        external
        onlyOwner()
    {
        votingAppTypeToVoteIdToDiscussionUrl[votingAppType][voteId] = discussionUrl;
        emit SetDiscussionUrl(votingAppType, voteId, discussionUrl);
    }

    /// @notice Used by the DAO dashboard client to retrieve user staking data
    /// @param userAddress User address
    /// @return apr Staking reward APR
    /// @return api3Supply API3 total supply
    /// @return totalStake Total amount staked at the pool
    /// @return totalShares Total pool shares (also represents total voting
    /// power)
    /// @return stakeTarget Pool stake target in percentages
    /// @return userApi3Balance User API3 balance
    /// @return userStaked Amount of staked tokens the user has at the pool
    /// @return userUnstaked Amount of non-staked tokens the user has at the
    /// pool
    /// @return userVesting Amount of tokens not yet vested to the user (it is
    /// not withdrawable, similar to `userLocked`)
    /// @return userUnstakeAmount Amount of tokens the user scheduled to
    /// unstake
    /// @return userUnstakeShares Amount of shares the user gave up to schedule
    /// the unstaking
    /// @return userUnstakeScheduledFor Time when the scheduled unstake will
    /// mature
    /// @return userLocked Amount of rewards the user has received that are not
    /// withdrawable yet
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
            uint256 userUnstakeAmount,
            uint256 userUnstakeShares,
            uint256 userUnstakeScheduledFor,
            uint256 userLocked
            )
    {
        apr = api3Pool.apr();
        api3Supply = api3Token.totalSupply();
        totalStake = api3Pool.totalStake();
        totalShares = api3Pool.totalShares();
        stakeTarget = api3Pool.stakeTarget();
        userApi3Balance = api3Token.balanceOf(userAddress);
        userStaked = api3Pool.userStake(userAddress);
        (
            userUnstaked,
            userVesting,
            userUnstakeAmount,
            userUnstakeShares,
            userUnstakeScheduledFor,
            , // lastDelegationUpdateTimestamp
            // lastProposalTimestamp
            ) = api3Pool.getUser(userAddress);
        userLocked = api3Pool.userLocked(userAddress);
    }

    /// @notice Used by the DAO dashboard client to retrieve the treasury and
    /// user delegation data
    /// @dev In addition to the ERC20 tokens, it returns the ETH balances of
    /// the treasuries
    /// @param userAddress User address
    /// @return names ERC20 (+ Ethereum) names
    /// @return symbols ERC20 (+ Ethereum) symbols
    /// @return decimals ERC20 (+ Ethereum) decimals
    /// @return balancesOfPrimaryAgent ERC20 (+ Ethereum) balances of the
    /// primary agent
    /// @return balancesOfSecondaryAgent ERC20 (+ Ethereum) balances of the
    /// secondary agent
    /// @return proposalVotingPowerThreshold Proposal voting power threshold in
    /// percentages
    /// @return userVotingPower Voting power of the user, including delegations
    /// @return delegatedToUser Voting power delegated to user
    /// @return delegate Address that the user has delegated to
    /// @return lastDelegationUpdateTimestamp When the user has last updated
    /// their delegation
    /// @return lastProposalTimestamp When the user has last made a proposal
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
            uint256 delegatedToUser,
            address delegate,
            uint256 lastDelegationUpdateTimestamp,
            uint256 lastProposalTimestamp
            )
    {
        names = new string[](erc20Addresses.length + 1);
        symbols = new string[](erc20Addresses.length + 1);
        decimals = new uint8[](erc20Addresses.length + 1);
        balancesOfPrimaryAgent = new uint256[](erc20Addresses.length + 1);
        balancesOfSecondaryAgent = new uint256[](erc20Addresses.length + 1);
        for (uint256 i = 0; i < erc20Addresses.length; i++)
        {
            IERC20Metadata erc20 = IERC20Metadata(erc20Addresses[i]);
            names[i] = erc20.name();
            symbols[i] = erc20.symbol();
            decimals[i] = erc20.decimals();
            balancesOfPrimaryAgent[i] = erc20.balanceOf(api3Pool.agentAppPrimary());
            balancesOfSecondaryAgent[i] = erc20.balanceOf(api3Pool.agentAppSecondary());
        }
        names[erc20Addresses.length] = "Ethereum";
        symbols[erc20Addresses.length] = "ETH";
        decimals[erc20Addresses.length] = 18;
        balancesOfPrimaryAgent[erc20Addresses.length] = address(api3Pool.agentAppPrimary()).balance;
        balancesOfSecondaryAgent[erc20Addresses.length] = address(api3Pool.agentAppSecondary()).balance;
        proposalVotingPowerThreshold = api3Pool.proposalVotingPowerThreshold();
        userVotingPower = api3Pool.userVotingPower(userAddress);
        delegatedToUser = api3Pool.delegatedToUser(userAddress);
        delegate = api3Pool.userDelegate(userAddress);   
        (
            , // unstaked
            , // vesting
            , // unstakeAmount
            , // unstakeShares
            , // unstakeScheduledFor
            lastDelegationUpdateTimestamp,
            lastProposalTimestamp
            ) = api3Pool.getUser(userAddress);
    }

    /// @notice Used by the DAO dashboard client to retrieve static vote data
    /// @dev `discussionUrl` is not actually static but can be treated as such
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param userAddress User address
    /// @param voteIds Array of vote IDs for which data will be retrieved
    /// @return startDate Start date of the vote
    /// @return supportRequired Support required for the vote to pass in
    /// percentages
    /// @return minAcceptQuorum Minimum acceptance quorum required for the vote
    /// to pass in percentages
    /// @return votingPower Total voting power at the time the vote was created
    /// @return script The EVMScript that will be run if the vote passes
    /// @return userVotingPowerAt User's voting power at the time the vote was
    /// created
    /// @return discussionUrl Discussion URL set for the vote by the contract
    /// owner
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
            uint256[] memory userVotingPowerAt,
            string[] memory discussionUrl
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
        discussionUrl = new string[](voteIds.length);
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
            discussionUrl[i] = votingAppTypeToVoteIdToDiscussionUrl[votingAppType][voteIds[i]];
        }
    }

    /// @notice Used by the DAO dashboard client to retrieve dynamic vote data
    /// @dev `delegateAt` is actually static but we already have to fetch it
    /// to fetch the related dynamic data so we also return it in this mtehod
    /// @param votingAppType Enumerated voting app type (primary or secondary)
    /// @param userAddress User address
    /// @param voteIds Array of vote IDs for which data will be retrieved
    /// @return executed If the vote has been executed
    /// @return yea Total voting power voted for "For"
    /// @return nay Total voting power voted for "Against"
    /// @return voterState Vote cast by the user
    /// @return delegateAt Address the user has delegated to at the time the
    /// vote was created
    /// @return delegateState Vote cast by the delegate of the user
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
                snapshotBlock,
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
