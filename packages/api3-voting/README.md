# API3 Voting App

> A slightly customized version version of the [Aragon Voting app](https://github.com/aragon/aragon-apps/tree/631048d54b9cc71058abb8bd7c17f6738755d950/apps/voting)

Unlike the Aragon Voting app that integrates to a generic MiniMe token, the API3 Voting app integrates to the API3 pool.
This provides the following additional features:

- Does not allow users to create a new vote less than `EPOCH_LENGTH` (defined in the API3 pool) apart (immutably set as 1 week)
- Does not allow users that have less than `proposalVotingPowerThreshold` (defined in the API3 pool) to create a new vote (governable, initial value 0.1%)
