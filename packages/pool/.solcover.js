module.exports = {
  skipFiles: ["auxiliary/Api3Token.sol", "auxiliary/TimelockManager.sol"],
  mocha: {
    timeout: 60_000,
  },
};
