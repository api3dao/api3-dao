# API3 DAO Convenience

> Convenience contract used to make batch view calls to DAO contracts

Note that `test:coverage` will not work because the contract uses the entire stack.
See [this issue](https://github.com/sc-forks/solidity-coverage/issues/417) for more information.
You can remove one of the returned fields (e.g., `userApi3Balance`) from `getUserStakingData()` (and remove the respective tests) to get it to work.

## Public interfaces

Client applications can use the following interfaces to retrieve information and set values on the DAO:

- ### api3Token

  Governance token of the DAO

- ### api3Pool

  Staking pool of the DAO

- ### erc20Addresses

  List of ERC20 addresses that will be displayed in the DAO treasury

- ### votingAppTypeToVoteIdToDiscussionUrl

  Links to the discussion venues for each vote

- ### setErc20Addresses

  Called by the owner to update the addresses of the contract addresses of the ERC20 tokens that will be displayed in the treasury.

- ### setDiscussionUrl

  Called by the owner to update the discussion URL of a specific vote to be displayed on the DAO dashboard.

- ### getUserStakingData

  Information about pool staking like APR, token supply and stake target as well as user specific staking data.

- ### getTreasuryAndUserDelegationData

  Information about the tokens in the treasury and voting delegation for a user.

- ### getStaticVoteData

  Information about the vote that never changes. For example: start date, support required, minimum accepted quorum, user voting power at the time and discussion url.

- ### getDynamicVoteData

  Information about the vote that changes. For example: whether vote was executed or not, yeas and nays, voterState and delegation data.

- ### getOpenVoteIds
  List IDs of the votes that are currently open.
