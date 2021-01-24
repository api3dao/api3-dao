import { getEnvVariables } from "utils/environment";

const { REACT_APP_NETWORK: Network } = getEnvVariables();
// Below are mainnet addresses
const API3 = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
const API3Staked = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
// As of Jan 23 the API Token && API3PoolAddress for testing in playground in rinkeby
export const API3Token = "0xE31538D72C9d4372d4400c51430eAa24db17cA31";
export const API3Pool = "0x7Fa7C6af880D9d31CA7FAdB0CBA9fc15dF2dC93f";

const MainNetTokens = {
  API3,
  API3Staked,
  // hardcoded for now.
  API3Token,
  API3Pool,
}

const RinkebyTokens = {
  API3: "0xd49f5f9e968bc345520ec8cc9cefe6dad756a009",
  API3Staked: "0xd49f5f9e968bc345520ec8cc9cefe6dad756a009",
  API3Token,
  API3Pool,
}

const setNetworkTokens = () => {
  if(Network === "RINKEBY") {
    return RinkebyTokens;
  }
  else {
    return MainNetTokens;
  }
}

export const API3ContractAddresses = {
  ...setNetworkTokens(),
};
