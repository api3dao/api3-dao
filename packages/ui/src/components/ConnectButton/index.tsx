import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import BasicButton from "components/Button/Basic";
import { Web3 } from "services/web3"
import { getERC20Tokens } from "services/web3/erc20";
import { Web3Context, API3Context } from "contexts";

function ConnectButton() {
  const web3Context = useContext(Web3Context);
  const api3Context = useContext(API3Context);
  const history = useHistory();
  const connect = async () => {
    try {
      const instance = await Web3.getInstance();
      const address = await instance.getDefaultAddress();
      const { tokens } = await getERC20Tokens()
      web3Context.setAddress(address);
      api3Context.setTokens(tokens);
      if(address){
        history.push("/dashboard")
      }
      
    } catch (error) {
      console.log("error in connect button", error);
    }
  }

  return <BasicButton color="black" onClick={connect} title="Connect Wallet" />
}

export default ConnectButton;