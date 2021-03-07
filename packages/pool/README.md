# API3 Pool Contract

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

The contracts in `contracts/auxiliary/` are provided for reference and are outside the scope of this package.

# Specifications

Staking API3 tokens at the API3 pool contract grants the following:
- Governance: The only way to receive voting power at the API3 DAO is to stake tokens at the pool
- Rewards: Staking tokens at the pool grants the stakers rewards proportional to the amount they have staked
- Collateralization: Staked tokens at the pool will be used to insure the services the API3 DAO provides

## Governance

The API3 DAO will be implemented as an Aragon-based DAO.
This pool contract has a MiniMe token-like interface that the API3 DAO Voting app will use to determine the voting power of the stakers.

### Delegation

In case a user does not want to make proposals and vote directly, they can delegate their voting power to another user.
Delegation works only one-hop, i.e., if a user has delegated their voting power to another user that has also delegated to someone else, the delegation will not be counted for anyone's voting power.

### Spam protection

There are four mechanics that are implemented to protect against proposal spam:

1. A minimum governable threshold of voting power is required to make a proposal (initial value: 0.1%)
1. A user cannot make proposals less than 7 days apart
1. A user cannot update their delegation less than 7 days apart
1. A user will have to "schedule an unstake" a governable period of time (minimum and initial value: 7 days) before being able to unstake

## Rewards

The aim of the staking rewards is to ensure that the pool is staked at enough to:
1. Prevent governance attacks (e.g., aiming to pass malicious proposals)
1. Ensure that the pool remains solvent in the case of an insurance claim payout

For this reason, the pool pays staking rewards every 7 days.

### Adaptive rewards

Since the aim is to meet a staking target, the staking reward increases automatically to incentivize staking when the pool runs low, and decreases to reduce unnecessary emission when the pool is already well-funded.
The staking reward gets updated every 7 days based on a governable staking target and the current pool funds.
The staking reward is a percentage of the total token supply (and not an absolute number of tokens).

### Reward locks

There needs to be an incentive for the stakers to participate in governance (either directly or through delegation), otherwise it would be rational to only stake and collect the staking rewards.
However, quantifying "governance performance" in number of proposals voted on, etc. would not be accurate because the resulting governance activity will not necessarily be beneficial.

As a solution, we lock up staking rewards for 1 year, meaning that the stakers will share long term incentives with the DAO/project, and thus will have to do their best by participating in governance.
In the case that this lock-up discourages staking, rewards float upwards automatically (with the adaptive rewards scheme) and draws in new stakers.
The locked up rewards are stakable, i.e., they get compounded.

## Collateralization

The API3 DAO will insure its services, and thus implement the skin-in-the-game aspect for its oracles at the governance-level.
This is superior to oracle or data feed-level security schemes, as they do not protect against governance-level failures.

The pool funds being used to collateralize the insurance service means that any claim payouts will slash the stakers/governing parties.
As a result, the DAO will be governed to optimize the security of its services.

The practical implementation of this is achieved through trusted "claims manager" contracts that are authorized to withdraw tokens from the pool.
For example, such a contract can be implemented as an integration to a dispute resolution protocol.
Note that it is intended that whether the claims will be paid out gets decided by a third party, and not the API3 DAO.

### Claim evasion protection

Users may unstake to frontrun an insurance claim/payout to avoid being slashed.
To prevent this, users will have to "schedule an unstake" a governable period of time (minimum and initial value: 7 days) before being able to unstake.
Since insurance claims will likely get resolved in more than 7 days, the DAO is expected to increase this waiting period (e.g., to 30 days) once the insurance mechanism is implemented.
To prevent users from scheduling unstakes constantly as a back-up plan, the user's staking reward for the epoch they have scheduled an unstake gets revoked.
