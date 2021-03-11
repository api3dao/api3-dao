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

The package that keeps the DAO configuration and deployment implementation.

### [`@api3-dao/pool`](/packages/pool/README.md)

A pool contract that users can stake API3 tokens to receive voting power at the DAO.
It implements a MiniMe interface that integrates to the API3 Voting app.
