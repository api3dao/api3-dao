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

- Test, get gas and coverage reports
```sh
npm run test
npm run test:gas
npm run test:coverage
```

- Receive `git diff` reports comparing Api3Voting to Voting in the `diff/` directory
```sh
npm run diff
```

- See the deployed versions
```sh
aragon apm versions api3voting.open.aragonpm.eth --environment <ropsten/rinkeby/mainnet>
```

## Deployment 

*Note: Use Node v12, the Aragon tooling is not compatible with newer versions.*

- Install IPFS, initialize it and start the daemon
```sh
ipfs init
ipfs daemon
```

- Publish updates
```
npx buidler publish major --network <ropsten/rinkeby/mainnet>
```

See the [Aragon docs](https://hack.aragon.org/docs/guides-publish) for more information.
Modify `buidler.config.js` to update the deployer account, provider, etc.
