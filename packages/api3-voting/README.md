# API3 Voting App

This is a customized version of the [Aragon Voting app](https://github.com/aragon/aragon-apps/tree/631048d54b9cc71058abb8bd7c17f6738755d950/apps/voting).
It integrates to the API3 pool instead of a generic MiniMe token to determine voting power.
It also implements the following additional features:

- Does not allow users to create a new vote less than `epochLength` (defined in the API3 pool) apart (immutably set as 1 week)
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

## Deployment 

To deploy updates of the contract on the rinkeby chain please call the following command in the terminal:

```shell script
npx buidler publish minor --network rinkeby
```
To change the deployment address, please
modify it in the `buidler.config.js` rinkeby config


In case of deployment on mainnet additional configuration needs to be done, 
the address will be needed in the `buidler.conf.js`.
