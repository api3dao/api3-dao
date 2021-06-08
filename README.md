<p align="center">
  <img src="https://github.com/api3dao/api3-docs/raw/master/figures/api3.png" width="400" />
</p>

[![api3-dao](https://circleci.com/gh/api3dao/api3-dao.svg?style=svg)](https://app.circleci.com/pipelines/github/api3dao)

# API3 DAO

This repository contains API3 DAO smart contracts along with their tests, configuration, and deployment information.

## Packages

This is a monorepo managed using [Lerna](https://github.com/lerna/lerna). It houses the following packages:

### [`@api3-dao/api3-voting`](/packages/api3-voting/README.md)

A customized version of the Aragon Voting app.
It integrates with the pool contract to implement proposal spam protection measures.

### [`@api3-dao/dao`](/packages/dao/README.md)

The package that keeps the DAO configuration and deployment implementation.

### [`@api3-dao/pool`](/packages/pool/README.md)

A pool contract that users can stake API3 tokens to receive voting power at the DAO.
It implements a MiniMe interface that integrates to the Api3Voting app.

## Instructions

To install the dependencies, run this at the repository root:
```sh
npm run bootstrap
```

To test [`pool`](/packages/pool/README.md) package please run:
```sh
npm run test:pool
```

For [`dao`](/packages/pool/README.md) package:
```sh
npm run test:dao
```

For [`api3-voting`](/packages/pool/README.md):
```sh
npm run test:api3-voting
```

## Licensing

This is a multi-license project. Please check the licensing information inside each package folder. 

## Contributing

To request/propose new features, fixes, etc. create an issue.
If you wish to contribute to the project, contact us over [our Telegram](https://t.me/API3DAO).
