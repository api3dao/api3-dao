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

## Audits

This repo is audited by the following in this order:
- [Solidified](https://github.com/solidified-platform/audits/blob/2bfe9e613c69333ba0abe4b262579b2540619780/Audit%20Report%20-%20API3DAO%20%20%5B15.04.2021%5D.pdf)
- [Quantstamp](https://certificate.quantstamp.com/full/api-3)
- Team Omega

You can also find the audit reports in [`reports/`](/reports).
Note that the [`convenience`](https://github.com/api3dao/api3-dao/tree/main/packages/convenience) package implements `view` functions for the [dashboard](https://github.com/api3dao/api3-dao-dashboard/) and is developed after the audits.

[![QS audit seal](/reports/audit-seal-api3.png?raw=true)](https://certificate.quantstamp.com/full/api-3)



## Bug bounty

If you have detected an issue that may cause serious consequences such as loss of funds:
- Mail security@api3.org explaining the issue. You will be contacted.
- Do not disclose the issue to anyone else in any form until it is addressed.

If you are the first one to disclose the issue and we decide to act on it, you will be rewarded proportional to the severity of the issue.
Our bug bounty program will be further formalized in the future.
