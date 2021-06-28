# API3 DAO Convenience

> Convenience contract used to make batch view calls to DAO contracts

`solidity-coverage` is not used because the stack depth is already used to its full extent.
See [this issue](https://github.com/sc-forks/solidity-coverage/issues/417) for more information.

## Public Interface

Client applications can use the following interface to retrieve information from the DAO:

- ### api3Token

  Governance token of the DAO

```solidity
function api3Token()
    external
    view
    returns (address);
```

- ### api3Pool

  Staking pool of the DAO

```solidity
function api3Pool()
    external
    view
    returns (address);
```

- ### erc20Addresses

  List of ERC20 addresses that will be returned by `getTreasuryAndUserDelegationData()`

```solidity
function erc20Addresses()
    external
    view
    returns (address[] memory);
```

- ### votingAppTypeToVoteIdToDiscussionUrl

  Links to the discussion venues for each vote

```solidity
function votingAppTypeToVoteIdToDiscussionUrl(
    VotingAppType votingApptype,
    uint256 voteId
    )
    external
    view
    returns (string memory);
```

- ### getUserStakingData

  Information about pool staking like APR, token supply and stake target as well as user specific staking data

```solidity
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
        );
```

- ### getTreasuryAndUserDelegationData

  Information about the tokens in the treasury and voting delegation for a user

```solidity
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
        );
```

- ### getStaticVoteData

  Information about the vote that never changes.
For example, start date, support required, minimum accepted quorum, user voting power at the time and discussion URL

```solidity
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
        );
```

- ### getDynamicVoteData

  Information about the vote that changes. For example: whether vote was executed or not, yeas and nays, voter state and delegation data

```solidity
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
        );
```

- ### getOpenVoteIds

  IDs of the votes that are currently open

```solidity
function getOpenVoteIds(VotingAppType votingAppType)
    external
    view
    returns (uint256[] memory voteIds);
```

## Owner Interface

- ### setErc20Addresses

  Called by the owner to update the addresses of the contract addresses of the ERC20 tokens that will be returned by `getTreasuryAndUserDelegationData()`
```solidity
function setErc20Addresses(address[] calldata _erc20Addresses)
        external;
```

- ### setDiscussionUrl

  Called by the owner to update the discussion URL of a specific vote to be displayed on the DAO dashboard

```solidity
function setDiscussionUrl(
    VotingAppType votingAppType,
    uint256 voteId,
    string calldata discussionUrl
    )
    external;
```
