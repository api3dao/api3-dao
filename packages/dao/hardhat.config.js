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
    version: "0.4.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
