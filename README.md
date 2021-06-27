# API3 DAO

- Install the dependencies
```sh
npm run bootstrap
```

## Packages

### [`@api3-dao/api3-voting`](/packages/api3-voting/README.md)

A customized version of the Aragon Voting app.
It integrates with the pool contract to implement proposal spam protection measures.

### [`@api3-dao/dao`](/packages/dao/README.md)

The package that keeps the DAO configuration and deployment implementation

### [`@api3-dao/pool`](/packages/pool/README.md)

A pool contract that users can stake API3 tokens to receive voting power at the DAO

### [`@api3-dao/convenience`](/packages/convenience/README.md)

A convenience contract used to make batch view calls to the DAO contracts

## Bug bounty

If you have detected an issue that may cause serious consequences such as loss of funds:
- Mail security@api3.org explaining the issue. You will be contacted.
- Do not disclose the issue to anyone else in any form until it is addressed.

If you are the first one to disclose the issue and we decide to act on it, you will be rewarded proportional to the severity of the issue.
Our bug bounty program will be further formalized in the future.
