# API3 DAO Contract

- Build
```sh
npm run build
```
- Receive `git diff` reports in the `diff/` directory
```sh
npm run diff
```

# Deployment

1. Publish `Api3Voting.sol` as an Aragon app

1. Replace the `VOTING_APP_ID` in `Api3BaseTemplate.sol` with the `Api3Voting.sol` app ID

1. Deploy `Api3Pool.sol` from the `@api3-dao/pool` package

1. Deploy the DAO using `Api3Template.sol` and the `Api3Pool.sol` address

1. Set the DAO Agent at `Api3Pool.sol` as the address of the Agent app of the DAO

1. Set the API3 pool at `Api3Voting.sol` as the address of the API3 pool
