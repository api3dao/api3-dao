require("dotenv").config();
const { usePlugin } = require("@nomiclabs/buidler/config");

usePlugin("@nomiclabs/buidler-ganache");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("buidler-gas-reporter");
usePlugin("solidity-coverage");
usePlugin("@aragon/buidler-aragon");

module.exports = {
  aragon: {
    appServePort: 8001,
    clientServePort: 3000,
    appBuildOutputPath: "dist/",
    appSrcPath: "./",
    appName: "api3voting",
  },
  // The gas reporter plugin do not properly handle the buidlerevm
  // chain yet. In the mean time we should 'npx buidler node' and
  // then attach to running process using '--network localhost' as
  // explained in: https://buidler.dev/buidler-evm/#connecting-to-buidler-evm-from-wallets-and-other-software.
  // You can also run 'yarn devchain' and on a separate terminal run 'yarn test:gas'
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
  networks: {
    // Local development network to test coverage. Solidity coverage
    // pluging launches its own in-process ganache server.
    // and expose it at port 8555.
    coverage: {
      url: "http://localhost:8555",
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/4c9049736af84c46ad0972910df0476a",
      chainId: 1,
      accounts: [process.env.MAINNET_PRIVATE_KEY || ""],
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/4c9049736af84c46ad0972910df0476a",
      chainId: 3,
      accounts: [process.env.ROPSTEN_PRIVATE_KEY || ""],
      gasLimit: "auto",
      gasPrice: 1000000000,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/4c9049736af84c46ad0972910df0476a",
      chainId: 4,
      accounts: [process.env.RINKEBY_PRIVATE_KEY || ""],
      gasLimit: "auto",
      gasPrice: 1000000000,
    },
  },
  solc: {
    version: "0.4.24",
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
};
