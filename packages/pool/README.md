# API3 Pool Contract

Make sure you have followed the [instructions](/README.md) to install the dependencies first.

- Build
```sh
npm run build
```
- Test, get test coverage and gas reports
```sh
npm run test
npm run test:coverage
npm run test:gas
```

- Create `credentials.json` similar to `credentials.example.json` and deploy
```sh
npm run deploy:rinkeby
npm run deploy:mainnet
```

The contracts in `contracts/auxiliary/` are provided for reference and are outside the scope of this package (and its audits).

The contracts in `contracts/mock/` are implemented to facilitate unit tests and will not be used in production.

If you have [Graphviz](https://www.graphviz.org/) installed, you can also view dependency graphs of the various components which make up the `Api3Pool` contract, via the [`surya` analysis tool](https://github.com/ConsenSys/surya), e.g.:

```sh
cd packages/pool/contracts
../node_modules/.bin/surya inheritance *.sol interfaces/*.sol | dot -Tpng >pool-inheritance.png
../node_modules/.bin/surya graph *.sol | fdp -Tpng >pool-graph.png
```

# Specifications

Staking API3 tokens at the API3 pool contract grants the following:
- Governance: The only way to receive voting power at the API3 DAO is to stake tokens at the pool
- Rewards: Staking tokens at the pool grants the stakers rewards proportional to the amount they have staked
- Collateralization: Staked tokens at the pool will be used to insure the services the API3 DAO provides

## Governance

The API3 DAO will be implemented as an Aragon-based DAO.
This pool contract has a MiniMe token-like interface that Api3Voting apps will use to determine the voting power of the stakers.

### Delegation

In case a user does not want to make proposals and vote directly, they can delegate their voting power to another user.
A user that has delegated their voting power cannot make or vote on proposals.
Delegation works only one-hop, i.e., if a user has delegated their voting power to another user that has also delegated to someone else, the delegation will not be counted for anyone's voting power.

### Proposal spam protection

There are four mechanics that are implemented to protect against proposal spam:

1. A minimum governable threshold of voting power is required to make a proposal (initial value: 0.1%)
2. A user cannot make proposals (using the same Api3Voting app) less than 7 days apart
3. A user cannot update their delegation less than 7 days apart
4. A user will have to "schedule an unstake" a governable period of time (minimum and initial value: 7 days) before being able to unstake

## Rewards

The aim of the staking rewards (paid every 7 days) is to ensure that the pool is staked at enough to:
1. Ensure adequate representation (and prevent governance attacks)
2. Ensure that the pool remains solvent in the case of an insurance claim payout

### Adaptive rewards

Since the aim is to meet a staking target, the staking reward increases automatically to incentivize staking when the pool runs low, and decreases to reduce unnecessary emission when the pool is already well-funded.
The staking reward gets updated every 7 days based on a governable staking target and the current pool funds.
The staking reward is a percentage of the total token supply (and not an absolute number of tokens) to avoid having to constantly adjust it in case of inflation/deflation.

### Reward locks

There needs to be an incentive for the stakers to participate in governance (either directly or through delegation), otherwise it would be rational to only stake and collect the staking rewards.
However, quantifying "governance performance" in number of proposals voted on, etc. would not be accurate because the resulting governance activity will not necessarily be beneficial.

As a solution, we lock up staking rewards for 1 year, meaning that the stakers will share long term incentives with the DAO/project, and thus will have to do their best by participating in governance.
In the case that this lock-up discourages staking, rewards float upwards automatically (with the adaptive rewards scheme) and draw in new stakers.
The locked up rewards are automatically staked, i.e., they get compounded.

## Collateralization

The API3 DAO will insure its services, and thus implement the skin-in-the-game aspect for its oracles at the governance-level.
This is superior to oracle or data feed-level security schemes, as they do not protect against governance-level failures.

The pool funds being used to collateralize the insurance service means that a claim payout will slash the stakers/governing parties.
As a result, the DAO will be governed to optimize the security of its services.

The practical implementation of this is achieved through trusted "claims manager" contracts that are authorized to withdraw tokens from the pool.
For example, such a contract can be implemented as an integration to a dispute resolution protocol.
Note that it is intended that whether the claims will be paid out gets decided by a third party, and not the API3 DAO.
It is expected for claims manager contracts to implement mechanisms to avoid catastrophic failure, for example by putting an upper limit to the total amount of payouts they can make within a limited period of time.

### Claim evasion protection

Users may unstake to frontrun an insurance claim/payout to avoid being slashed.
To prevent this, users will have to "schedule an unstake" a governable period of time (minimum and initial value: 7 days) before being able to unstake.
Since insurance claims will likely get resolved in more than 7 days, the DAO is expected to increase this waiting period (e.g., to 30 days) once the insurance mechanism is implemented.

# Implementation details

## Timelock transfers

API3 tokens allocated to founding members, builders and investors are timelocked at [`TimelockManager`](/contracts/auxiliary/TimelockManager.sol) contracts.
The beneficiaries of the timelocked tokens can withdraw their tokens to this pool contract, where the vesting schedule will be continued.
The tokens withdrawn to the pool will be able to be staked by their owners to receive voting power, staking rewards and be used as collateral.

## Over-population of `user.shares`

Each time a user stakes/unstakes, an additional element will be added to their `user.shares` `Checkpoint` array.
This array will be searched linearly while calling `balanceOfAt()` to vote (for the last week) and `getUserLocked()` to withdraw (for the last year).
In case the user bloats this array on purpose by repeatedly staking 1 (Wei) API3, they may manage to lock themselves out of voting/withdrawing.
Since this will only happen voluntarily and will get resolved automatically simply by not staking/unstaking for a while, it is not considered as an issue.

## Double Agent and Api3Voting apps

The DAO will have two pairs of Agents and Api3Voting apps, where having an Agent app make a transaction will require a proposal to be passed with the respective Api3Voting app.
The quorum requirements for the primary Api3Voting app will be high, and primary Agent app will be authorized to take security-critical actions (authorize claims manager contracts, authorize contracts to mint API3 tokens, update DAO parameters that could be attack vectors, secure the treasury, etc.).
The quorum requirements for the secondary Api3Voting app will be low, and the secondary Agent app will be used for more day-to-day proposals (set stake target parameters, give grants).

The Agent apps are authorized to update respective DAO parameters, and Api3Voting apps are authorized to mark the creation of a new proposal, which signals this contract to create a new checkpoint for the related records.
Note that primary and secondary proposal cooldowns are kept separately, which means that a user can make two proposals in less than 7 days, as long as one is done through the primary Api3Voting app and the other is done through the secondary Api3Voting app.
This is implemented as such to avoid unnecessary complexity.

## Binary search-able `user.shares`

`user.shares` at specific blocks are accessible through `userSharesAtWithBinarySearch()` by doing a binary search.
This method is not used internally in the pool contract, but is planned to be used by future contract implementations that may require to recall how much users have staked at a specific point in time.
Concerns about `user.shares` growing to unsearchable sizes are not within the scope of this contract's implementation as it does not depend on this method.

## Skipped rewards

User interactions call `payReward()`, which triggers the payment for the current epoch's reward if it was not already.
`payReward()` can also be called externally, in a stand-alone way.
If no one interacts with the pool contract in a whole week, the rewards for that week will not be paid out and the reward will not be updated.
This is not expected to happen in practice, and will not cause any issues if it does.

## Pool not being authorized to mint

If the pool not authorized to mint API3 tokens, it continues operating without paying out any rewards.
This is to prevent the pool from breaking in case its minting authorization is revoked due to any reason.
