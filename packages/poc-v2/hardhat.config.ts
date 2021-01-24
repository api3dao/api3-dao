import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";

const config: BuidlerConfig = {
  solidity: {
    compilers: [{ version: "0.6.8", settings: {} }],
  },
};
export default config;