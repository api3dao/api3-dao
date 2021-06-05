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
npx ganache-cli -i 15 --gasLimit 8000000 --port 8545
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

Go to `contracts/Api3Template.sol` and update:
```solidity
    // The Api3Voting app ID below is used on Rinkeby/Mainnet
    // It is derived using `namehash("api3voting.open.aragonpm.eth")`
    // bytes32 constant internal API3_VOTING_APP_ID = 0x323c4eb511f386e7972d45b948cc546db35e9ccc7161c056fb07e09abd87e554;

    // The Api3Voting app ID below is used on localhost
    // It is derived using `namehash("api3voting.aragonpm.eth")`
    bytes32 constant internal API3_VOTING_APP_ID = 0x727a0cf100ef0e645bad5a5b920d7fb71f8fd0eaf0fa579c341a045f597526f5;
```

as
```solidity
    // The Api3Voting app ID below is used on Rinkeby/Mainnet
    // It is derived using `namehash("api3voting.open.aragonpm.eth")`
    bytes32 constant internal API3_VOTING_APP_ID = 0x323c4eb511f386e7972d45b948cc546db35e9ccc7161c056fb07e09abd87e554;

    // The Api3Voting app ID below is used on localhost
    // It is derived using `namehash("api3voting.aragonpm.eth")`
    // bytes32 constant internal API3_VOTING_APP_ID = 0x727a0cf100ef0e645bad5a5b920d7fb71f8fd0eaf0fa579c341a045f597526f5;
```

and run
```
npm run deploy:rinkeby
```

## Verifying the DAO deployment

**This needs to be repeated with the final mainnet deployment.**

1. Install aragonCLI globally (specifying the package version because latest seems to be broken for some machines):
```sh
npm install -g @aragon/cli@7.0.4
```

2. Install [Frame](https://frame.sh/).
Run it and make sure that it is connected to the correct chain.

3. Inspect the DAO with the following
```sh
aragon dao apps <DAO kernel address> --use-frame
```
For example, you can use `0x825cc178f0510de72c8d3af4be69917935b3d269` on Rinkeby (**note that this may not be identical to the final version**).
Review the displayed information is correct.

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
aragon dao acl <DAO kernel address> --use-frame
```

7. Check that the following values are initialized correctly
- `api3Pool` and the voting parameters (`supportRequiredPct` and `minAcceptQuorumPct`) at the Api3Voting apps
- `api3Token`, `timelockManager`, `agentAppPrimary`, `agentAppSecondary`, `votingAppPrimary` and `votingAppSecondary` at the pool contract
- If any claims manager contracts are set for the pool, they are audited and implemented to pay out claims in a trustless way with fail-safes such as payout limits (note that the pool will be deployed with no claims managers set initially)

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
