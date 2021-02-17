import { HardhatUserConfig } from "hardhat/types"
import "@nomiclabs/hardhat-waffle"
import "hardhat-typechain"
import dotenv from "dotenv";

dotenv.config()

const { 
  INFURA_ID, 
  RINKEBY_PRIVATE_KEY, 
  RINKEBY_INFURA_URL,

} = process.env

console.log(
  INFURA_ID, 
  RINKEBY_PRIVATE_KEY, 
  RINKEBY_INFURA_URL,
);

const url = `${RINKEBY_INFURA_URL}${INFURA_ID}`;

const accounts = [`0x${RINKEBY_PRIVATE_KEY}`];

const rinkeby = {
  url,
  accounts,
}

const networks = {
  rinkeby,
}

const compilers = [{ version: "0.6.12", settings: {} }]

const solidity = {
  compilers,
}

const config: HardhatUserConfig = {
  solidity,
  networks,
}

export default config