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

## Verifying the DAO deployment

**This needs to be repeated with the final mainnet deployment.**

1. Install aragonCLI globally (specifying the package version because the current one seems to be broken for some machines):
```sh
npm install -g @aragon/cli@7.0.4
```

2. Install [Frame](https://frame.sh/).
Run it and make sure that it's connected to the correct chain.

3. Inspect the DAO with the following
```sh
aragon dao apps <DAO kernel address> --use-frame
```
For example, you can use `0x825cc178f0510de72c8d3af4be69917935b3d269` on Rinkeby (**note that this may not be identical to the final version**).
Verify that the displayed information is correct.

4. Verify that the ACL (Access Control List) is configured correctly
```sh
aragon dao acl <DAO kernel address> --use-frame
```

5. In (3), you should have seen Api3Voting apps with the ID `0x323c4eb511f386e7972d45b948cc546db35e9ccc7161c056fb07e09abd87e554`.
This is derived as `namehash("api3voting.open.aragonpm.eth")`.
To verify, run the following script
```sh
npm run derive-namehash
```

6. Set your Ethereum provider RPC URL in `~/.aragon/<network>_key.json` as below (this will connect to Frame so make sure that the correct chain is selected on it)
```json
{
  "rpc": "http://127.0.0.1:1248"
}
```

7. Check the contract address using the Aragon Package Manager
```sh
aragon apm versions api3voting.open.aragonpm.eth --environment rinkeby
```

8. Check the contract code on Etherscan

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
