# API3 DAO Convenience

> Convenience contract used to make batch view calls to DAO contracts

Note that `test:coverage` will not work because the contract uses the entire stack.
See [this issue](https://github.com/sc-forks/solidity-coverage/issues/417) for more information.
You can remove one of the returned fields (e.g., `userApi3Balance`) from `getUserStakingData()` (and remove the respective tests) to get it to work.
