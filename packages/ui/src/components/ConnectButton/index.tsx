import React, { useContext } from "react";
import BasicButton from "components/Button/Basic";

import { Web3 } from "services/web3"
import { getERC20Tokens } from "services/web3/erc20";
import { Web3Context, API3Context } from "contexts";

function ConnectButton() {
  const web3Context = useContext(Web3Context);
  const api3Context = useContext(API3Context);

  const connect = async () => {
    const instance = await Web3.getInstance();
    const address = await instance.getDefaultAddress();
    const { tokens } = await getERC20Tokens()
    web3Context.setAddress(address);
    api3Context.setTokens(tokens);
  }

  return <BasicButton onClick={connect} title="Connect Wallet" />
}

export default ConnectButton;