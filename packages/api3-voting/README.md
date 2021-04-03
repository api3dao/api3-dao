# API3 Voting App

This is a customized version of the [Aragon Voting app](https://github.com/aragon/aragon-apps/tree/631048d54b9cc71058abb8bd7c17f6738755d950/apps/voting).
It integrates to the API3 pool instead of a generic MiniMe token to determine voting power.
It also implements the following additional features:

- Does not allow users to create a new vote less than `EPOCH_LENGTH` (defined in the API3 pool) apart (immutably set as 1 week)
- Does not allow users that have less than `proposalVotingPowerThreshold` (defined in the API3 pool) to create a new vote (governable, initial value 0.1%)

## Instructions

- Build
```sh
npm run compile
```

- Test
```sh
npm run test
npm run test:gas # while running `npm run devchain` on another terminal
```

- Receive `git diff` reports comparing Api3Voting to Voting in the `diff/` directory
```sh
npm run diff
```
