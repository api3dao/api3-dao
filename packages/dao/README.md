# API3 DAO Template

This is an API3-DAO template. It integrates two custom API3 voting apps. 

- Build
```sh
npm run compile
```

- Test
```sh
npm run test
```

## Deployment

### Local

Run this
```sh
npx ganache-cli --gasLimit 8000000
```

and this on a separate terminal
```sh
npm run deploy:rpc
```

### Rinkeby

Create a key file for Aragon
```sh
cd ~ && mkdir .aragon && cd .aragon && touch rinkeby_key.json
```

and add the following to the file created
```json
{
  "rpc": "https://rinkeby.infura.io/v3/your_infura_id",
  "keys": [
    "your_private_key"
  ]
}
```

and run
```
npm run deploy:rinkeby
```

## Verifying the Mainnet deployment

```json
{
  "api3Token": "0x0b38210ea11411557c13457D4dA7dC6ea731B88a",
  "timelockManager": "0xFaef86994a37F1c8b2A5c73648F07dd4eFF02baA",
  "api3Pool": "0x6dd655f10d4b9e242ae186d9050b68f725c76d76",
  "convenience": "0x95087266018b9637aff3d76d4e0cad7e52c19636",
  "dao": "0x593ea926ee9820a933488b6a288433c387d06dba",
  "acl": "0x1e7ecc6d3b5b4cfdfc71cb7c3ea9ac4a55f4195a",
  "votingAppPrimary": "0xdb6c812e439ce5c740570578681ea7aadba5170b",
  "votingAppSecondary": "0x1c8058e72e4902b3431ef057e8d9a58a73f26372",
  "agentAppPrimary": "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae",
  "agentAppSecondary": "0x556ecbb0311d350491ba0ec7e019c354d7723ce0"
}
```

1. Install aragonCLI globally (specifying the package version because latest seems to be broken for some machines):
```sh
npm install -g @aragon/cli@7.0.4
```

2. Install [Frame](https://frame.sh/).
Run it and make sure that it is connected to the correct chain.

3. Inspect the DAO with the following
```sh
aragon dao apps 0x593ea926ee9820a933488b6a288433c387d06dba --use-frame
```
Review that the displayed information is correct.
```sh
aragon dao apps 0x9B64177757a0BD2A042446C8d910526476B7Bf57 --use-frame
```

4. In (3), you should have seen Api3Voting apps with the ID `0x323c4eb511f386e7972d45b948cc546db35e9ccc7161c056fb07e09abd87e554`.
This is derived as `namehash("api3voting.open.aragonpm.eth")`.
To verify, run the following script
```sh
npm run derive-namehash
```

5. The Api3Voting apps will have a proxy address each.
Read the contract address they are pointing at using `implementation()` (you can use Etherscan for this because the code of the proxy contract will be verified).
Then check the source code at this implementation address using Etherscan and verify that it is identical to `Api3Voting.sol`.

6. Verify that the ACL (Access Control List) is configured correctly
```sh
aragon dao acl 0x593ea926ee9820a933488b6a288433c387d06dba --use-frame
```

You can compare with API3DAOv1
```sh
aragon dao acl 0x9B64177757a0BD2A042446C8d910526476B7Bf57 --use-frame
```

7. Check that the following values are initialized correctly
- `api3Pool` and the voting parameters (`supportRequiredPct` and `minAcceptQuorumPct`) at the Api3Voting apps
- `api3Token`, `timelockManager`, `agentAppPrimary`, `agentAppSecondary`, `votingAppPrimary` and `votingAppSecondary` at the pool contract
- If any claims manager contracts are set for the pool, they are audited and implemented to pay out claims in a trustless way with fail-safes such as payout limits (note that the pool will be deployed with no claims managers set initially and the DAO does not allow proposals in the first epoch to set a claims manager)

## Permissions

### System
_Handle apps and permissions_

| App               | Permission            | Grantee              | Manager              |
| ----------------- | --------------------- | -------------------- | -------------------- |
| Kernel            | APP_MANAGER           | PrimaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |
| ACL               | CREATE_PERMISSIONS    | PrimaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |
| EVMScriptRegistry | REGISTRY_MANAGER      | PrimaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |
| EVMScriptRegistry | REGISTRY_ADD_EXECUTOR | PrimaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |


### Board

#### Primary Voting

_Enforces important board decisions_

| App                  | Permission     | Grantee                 | Manager              |
| -------------------- | -------------- | ----------------------- | -------------------- |
| PrimaryVoting `[BOARD]` | CREATE_VOTES   | Any entity  `[BOARD]`   | PrimaryVoting `[SHARE]` |
| PrimaryVoting `[BOARD]` | MODIFY_QUORUM  | PrimaryAgent   `[BOARD]`   | PrimaryVoting `[SHARE]` |
| PrimaryVoting `[BOARD]` | MODIFY_SUPPORT | PrimaryAgent   `[BOARD]`   | PrimaryVoting `[SHARE]` |

#### Secondary Voting

_Enforces less important board decisions_

| App                       | Permission     | Grantee                 | Manager              |
| ------------------------- | -------------- | ----------------------- | -------------------- |
| SecondaryVoting `[BOARD]` | CREATE_VOTES   | Any entity  `[BOARD]`   | PrimaryVoting `[SHARE]` |
| SecondaryVoting `[BOARD]` | MODIFY_QUORUM  | PrimaryAgent   `[BOARD]`   | PrimaryVoting `[SHARE]` |
| SecondaryVoting `[BOARD]` | MODIFY_SUPPORT | PrimaryAgent   `[BOARD]`   | PrimaryVoting `[SHARE]` |

#### Primary Agent

_Enforces important board decisions_

| App       | Permission             | Grantee              | Manager              |
| --------- | ---------------------- | -------------------- | -------------------- |
| PrimaryAgent | EXECUTE                | PrimaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |
| PrimaryAgent | RUN_SCRIPT             | PrimaryVoting           | PrimaryVoting `[SHARE]` |
| PrimaryAgent | REMOVE_PROTECTED_TOKEN | NULL                 | NULL                 |
| PrimaryAgent | SAFE_EXECUTE           | NULL                 | NULL                 |
| PrimaryAgent | DESIGNATE_SIGNER       | NULL                 | NULL                 |
| PrimaryAgent | ADD_PRESIGNED_HASH     | NULL                 | NULL                 |
| PrimaryAgent | ADD_PROTECTED_TOKEN    | NULL                 | NULL                 |
| PrimaryAgent | TRANSFER               | PrimaryVoting           | PrimaryVoting           |


#### Secondary Agent

_Enforces less important board decisions_

| App            | Permission             | Grantee                   | Manager              |
| -------------- | ---------------------- | ------------------------- | -------------------- |
| SecondaryAgent | EXECUTE                | SecondaryVoting `[SHARE]` | PrimaryVoting `[SHARE]` |
| SecondaryAgent | RUN_SCRIPT             | SecondaryVoting           | PrimaryVoting `[SHARE]` |
| SecondaryAgent | REMOVE_PROTECTED_TOKEN | NULL                      | NULL                 |
| SecondaryAgent | SAFE_EXECUTE           | NULL                      | NULL                 |
| SecondaryAgent | DESIGNATE_SIGNER       | NULL                      | NULL                 |
| SecondaryAgent | ADD_PRESIGNED_HASH     | NULL                      | NULL                 |
| SecondaryAgent | ADD_PROTECTED_TOKEN    | NULL                      | NULL                 |
| SecondaryAgent | TRANSFER               | PrimaryVoting                | PrimaryVoting           |

#### Vault and Finance

_Handle board vault_

| App                   | Permission  | Grantee          | Manager              |
| --------------------- | ----------- | ---------------- | -------------------- |
| Vault(PrimaryAgent)      | TRANSFER    | PrimaryVoting       | PrimaryVoting `[SHARE]` |
| Vault(SecondaryAgent) | TRANSFER    | SecondaryVoting  | PrimaryVoting `[SHARE]` |
