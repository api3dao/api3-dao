import { Web3 } from "services/web3";
import { API3TokenABI } from "services/web3/abis";
import { TokenContractAddresses } from "services/web3/erc20/tokens";
import { divideNumberByDecimals } from "utils/numbers";

interface Tokens {
  currentETHAddress: string
  tokens: Token[]
  API3: Token;
  API3Staked: Token;
}

interface Token {
  name: string
  balance: number
}

export const getERC20Tokens = async (): Promise<Tokens> => {
  const web3 = await Web3.getInstance() as any;
  // Here we check if the address connected to metamask holds API3 and API3Staked.
  const currentETHAddress = await web3.getDefaultAddress();

  const API3Contract = await web3.getContract(TokenContractAddresses.API3, API3TokenABI);
  const API3StakedContract = await web3.getContract(TokenContractAddresses.API3Staked, API3TokenABI);

  const API3TotalSupplyAmount = await API3Contract.totalSupply();
  const API3Amount = await API3Contract.balanceOf(currentETHAddress);
  const API3TokenDecimals = await API3Contract.decimals();

  const API3StakedTotalSupplyAmount = await API3StakedContract.totalSupply();
  const API3StakedAmount = await API3StakedContract.balanceOf(currentETHAddress);
  const API3StakedTokenDecimals = await API3StakedContract.decimals();
  
  const API3 = {
    totalSupply: divideNumberByDecimals(Number(API3TotalSupplyAmount.toString()), API3TokenDecimals),
    name: "API3",
    balance: divideNumberByDecimals(Number(API3Amount.toString()), API3TokenDecimals),
  }
  const API3Staked = {
    totalSupply: divideNumberByDecimals(Number(API3StakedTotalSupplyAmount.toString()), API3StakedTokenDecimals),
    name: "API3Staked",
    balance: divideNumberByDecimals(Number(API3StakedAmount.toString()), API3StakedTokenDecimals)
  }
  
  const tokens = [API3, API3Staked]
  
  const erc20Tokens = {
    currentETHAddress,
    API3,
    API3Staked,
    tokens,
  }

  return erc20Tokens;
};

export const checkAPI3 = async () => {
  const { API3 } = await getERC20Tokens();
  return API3.balance > 0;
};

export const checkAPI3Staked = async () => {
  const { API3Staked } = await getERC20Tokens();
  return API3Staked.balance > 0;
};

export const hasEitherAPI3orAPI3Staked = async () => {
  return (await checkAPI3()) || (await checkAPI3Staked());
};