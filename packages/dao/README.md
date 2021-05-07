# API3 DAO Template

This is an API3-DAO template. It integrates two custom API3 voting apps. 

- Build
```sh
npm run compile
```
If solc gives `RangeError: Maximum call stack size exceeded`, use Node v8 or the workaround described [here](https://ethereum.stackexchange.com/a/67173)

- Test
```sh
npm run test
```

- Deploy

To deploy this smart contract on the rinkeby chain you'll need to call

```shell script
npm run deploy:rinkeby
```

In case if you would like to publish it to aragon ens, you'll need to install aragon first
(which was proven impossible on my machine, so no help to you here)

## Permissions

### System
_Handle apps and permissions_

| App               | Permission            | Grantee              | Manager              |
| ----------------- | --------------------- | -------------------- | -------------------- |
| Kernel            | APP_MANAGER           | MainVoting `[SHARE]` | MainVoting `[SHARE]` |
| ACL               | CREATE_PERMISSIONS    | MainVoting `[SHARE]` | MainVoting `[SHARE]` |
| EVMScriptRegistry | REGISTRY_MANAGER      | MainVoting `[SHARE]` | MainVoting `[SHARE]` |
| EVMScriptRegistry | REGISTRY_ADD_EXECUTOR | MainVoting `[SHARE]` | MainVoting `[SHARE]` |


### Board


#### Main Voting
_Enforces important board's decisions_

| App                  | Permission     | Grantee                 | Manager              |
| -------------------- | -------------- | ----------------------- | -------------------- |
| MainVoting `[BOARD]` | CREATE_VOTES   | Any entity  `[BOARD]`   | MainVoting `[SHARE]` |
| MainVoting `[BOARD]` | MODIFY_QUORUM  | MainAgent   `[BOARD]`   | MainVoting `[SHARE]` |
| MainVoting `[BOARD]` | MODIFY_SUPPORT | MainAgent   `[BOARD]`   | MainVoting `[SHARE]` |

#### Secondary Voting
_Enforces less important board's decisions_

| App                       | Permission     | Grantee                 | Manager              |
| ------------------------- | -------------- | ----------------------- | -------------------- |
| SecondaryVoting `[BOARD]` | CREATE_VOTES   | Any entity  `[BOARD]`   | MainVoting `[SHARE]` |
| SecondaryVoting `[BOARD]` | MODIFY_QUORUM  | MainAgent   `[BOARD]`   | MainVoting `[SHARE]` |
| SecondaryVoting `[BOARD]` | MODIFY_SUPPORT | MainAgent   `[BOARD]`   | MainVoting `[SHARE]` |

#### Main Agent
_Enforces important board's decisions_

| App       | Permission             | Grantee              | Manager              |
| --------- | ---------------------- | -------------------- | -------------------- |
| MainAgent | EXECUTE                | MainVoting `[SHARE]` | MainVoting `[SHARE]` |
| MainAgent | RUN_SCRIPT             | MainVoting           | MainVoting `[SHARE]` |
| MainAgent | REMOVE_PROTECTED_TOKEN | NULL                 | NULL                 |
| MainAgent | SAFE_EXECUTE           | NULL                 | NULL                 |
| MainAgent | DESIGNATE_SIGNER       | NULL                 | NULL                 |
| MainAgent | ADD_PRESIGNED_HASH     | NULL                 | NULL                 |
| MainAgent | ADD_PROTECTED_TOKEN    | NULL                 | NULL                 |
| MainAgent | TRANSFER               | NULL                 | NULL                 |


#### Secondary Agent
_Enforces less important board's decisions_

| App            | Permission             | Grantee                   | Manager              |
| -------------- | ---------------------- | ------------------------- | -------------------- |
| SecondaryAgent | EXECUTE                | SecondaryVoting `[SHARE]` | MainVoting `[SHARE]` |
| SecondaryAgent | RUN_SCRIPT             | SecondaryVoting           | MainVoting `[SHARE]` |
| SecondaryAgent | REMOVE_PROTECTED_TOKEN | NULL                      | NULL                 |
| SecondaryAgent | SAFE_EXECUTE           | NULL                      | NULL                 |
| SecondaryAgent | DESIGNATE_SIGNER       | NULL                      | NULL                 |
| SecondaryAgent | ADD_PRESIGNED_HASH     | NULL                      | NULL                 |
| SecondaryAgent | ADD_PROTECTED_TOKEN    | NULL                      | NULL                 |
| SecondaryAgent | TRANSFER               | NULL                      | NULL                 |

#### Vault and Finance
_Handle board's vault_

| App     | Permission          | Grantee          | Manager              |
| ------- | ------------------- | ---------------- | -------------------- |
| Vault(MainAgent)   | TRANSFER            | MainVoting       | MainVoting `[SHARE]` |
| Vault(SecondaryAgent)   | TRANSFER            | SecondaryVoting       | SecondaryVoting `[SHARE]` |
