require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-gas-reporter");

const fs = require("fs");
let credentials = require("./credentials.example.json");
if (fs.existsSync("./credentials.json")) {
  credentials = require("./credentials.json");
}

module.exports = {
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    outputFile: "gas_report",
    noColors: true,
  },
  mocha: {
    timeout: 60000
  },
  networks: {
    mainnet: {
      url: credentials.mainnet.providerUrl || "",
      accounts: { mnemonic: credentials.mainnet.mnemonic || "" },
    },
    rinkeby: {
      url: credentials.rinkeby.providerUrl || "",
      accounts: { mnemonic: credentials.rinkeby.mnemonic || "" },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
