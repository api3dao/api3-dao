const { REACT_APP_NETWORK: Network } = process.env;

const API3 = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
const API3Staked = "0x0b38210ea11411557c13457d4da7dc6ea731b88a";
const MainNetTokens = {
  API3,
  API3Staked
}

const RinkebyTokens = {
  API3: "0x185edff5e79f79d811b468ab734b6f9b5426acc7",
  API3Staked: "0x185edff5e79f79d811b468ab734b6f9b5426acc7",
}

const setNetworkTokens = () => {
  if(Network === "RINKEBY") {
    return RinkebyTokens;
  }
  else {
    return MainNetTokens
  }
}

export const TokenContractAddresses = {
  ...setNetworkTokens(),
};
