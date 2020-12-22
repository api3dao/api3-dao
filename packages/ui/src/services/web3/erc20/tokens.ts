const { REACT_APP_NETWORK: Network } = process.env;

// Below are mainnet addresses
const API3 = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
const API3Staked = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
const MainNetTokens = {
  API3,
  API3Staked
}

const RinkebyTokens = {
  API3: "0xd49f5f9e968bc345520ec8cc9cefe6dad756a009",
  API3Staked: "0xd49f5f9e968bc345520ec8cc9cefe6dad756a009",
}

const setNetworkTokens = () => {
  if(Network === "RINKEBY") {
    return RinkebyTokens;
  }
  else {
    return MainNetTokens;
  }
}

export const TokenContractAddresses = {
  ...setNetworkTokens(),
};
