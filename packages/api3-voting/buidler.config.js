const { usePlugin } = require('@nomiclabs/buidler/config');

usePlugin("@nomiclabs/buidler-ganache");
usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('buidler-gas-reporter');
usePlugin('solidity-coverage');
usePlugin('@aragon/buidler-aragon');

const ACCOUNTS = (process.env.ETH_KEYS ? process.env.ETH_KEYS.split(',') : [])
  .map(key => key.trim());
const RINKEBY_DEPLOYER = "0xff5886c7e52052fc95e4bd6956b1e420d10693e62fbe506d61fa25b152093d54";
const ROPSTEN_DEPLOYER = "0xff5886c7e52052fc95e4bd6956b1e420d10693e62fbe506d61fa25b152093d54";

module.exports = {
  networks: {
    // Local development network using ganache. You can set any of the
    // Ganache's options. All of them are supported, with the exception
    // of accounts.
    // https://github.com/trufflesuite/ganache-core#options
    ganache: {
      url: 'http://localhost:8545',
      gasLimit: 6000000000,
      defaultBalanceEther: 100
    },
    // Local development network to test coverage. Solidity coverage
    // pluging launches its own in-process ganache server.
    // and expose it at port 8555.
    coverage: {
      url: 'http://localhost:8555',
    },
    // Mainnet network configured with Aragon node.
    mainnet: {
      url: 'https://mainnet.infura.io/v3/4c9049736af84c46ad0972910df0476a',
      accounts: ACCOUNTS
    },
    // Rinkeby network configured with Aragon node.
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/4c9049736af84c46ad0972910df0476a',
      chainId: 4,
      accounts: [RINKEBY_DEPLOYER],
      gasLimit: 'auto',
      gasPrice: 1000000000,
    },
    // Ropsten network configured with Aragon node.
    ropsten: {
      url: 'https://ropsten.infura.io/v3/4c9049736af84c46ad0972910df0476a',
      chainId: 3,
      accounts: [ROPSTEN_DEPLOYER],
      gasLimit: 'auto',
      gasPrice: 1000000000,
    },
    // Network configured to interact with Frame wallet. Requires
    // to have Frame running on your machine. Download it from:
    // https://frame.sh
    frame: {
      httpHeaders: { origin: 'buidler' },
      url: 'http://localhost:1248',
    }
  },
  solc: {
    version: '0.4.24',
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
  // The gas reporter plugin do not properly handle the buidlerevm
  // chain yet. In the mean time we should 'npx buidler node' and
  // then attach to running process using '--network localhost' as
  // explained in: https://buidler.dev/buidler-evm/#connecting-to-buidler-evm-from-wallets-and-other-software.
  // You can also run 'yarn devchain' and on a separate terminal run 'yarn test:gas'
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
  aragon: {
    appServePort: 8001,
    clientServePort: 3000,
    appBuildOutputPath: 'dist/',
    appSrcPath: './',
    appName: 'api3voting'
  },
};
