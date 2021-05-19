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

To deploy the dao to the local network please run

```shell script
npx ganache-cli -i 15 --gasLimit 8000000 --port 8545
```

and then

```shell script
npm run deploy:rpc
```

To deploy the dao to the `rinkeby` testnet you would first have to run 

```shell script
cd ~ && mkdir .aragon && cd .aragon && touch rinkeby_key.json
```

add config to the file that you've just created

```
{
  "rpc": "https://rinkeby.infura.io/v3/your_infura_id",
  "keys": [
    "your_private_key"
  ]
}
```

id for `Api3Voting` app is different on different networks, so for `rinkeby` deployment
you will need to go first to `contracts/ Api3Template.sol` and uncomment:

```
//    Record below is ID for Rinkeby/Mainnet
//    bytes32 constant internal API3_VOTING_APP_ID = 0x323c4eb511f386e7972d45b948cc546db35e9ccc7161c056fb07e09abd87e554;
```

then comment out the following line:

```
    bytes32 constant internal API3_VOTING_APP_ID = 0x727a0cf100ef0e645bad5a5b920d7fb71f8fd0eaf0fa579c341a045f597526f5;
```

after that you are good to go and deploy dao to `rinkeby`, please run the following command
to complete:

```
npm run deploy:rinkeby
```

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
| MainAgent | TRANSFER               | MainVoting           | MainVoting           |


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
| SecondaryAgent | TRANSFER               | MainVoting                | MainVoting           |

#### Vault and Finance
_Handle board's vault_

| App     | Permission          | Grantee          | Manager              |
| ------- | ------------------- | ---------------- | -------------------- |
| Vault(MainAgent)   | TRANSFER            | MainVoting       | MainVoting `[SHARE]` |
| Vault(SecondaryAgent)   | TRANSFER            | SecondaryVoting       | MainVoting `[SHARE]` |
