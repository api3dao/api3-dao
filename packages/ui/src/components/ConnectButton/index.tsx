import React from "react";
import {
  Button,
} from "@material-ui/core";

import { Web3 } from "services/web3"

import useStyles from "components/Navbar/styles";

function ConnectButton() {
  const classes = useStyles();
  const connect = async () => {
    console.log('WEB3', Web3);
  }
  return (
    <Button onClick={connect} color="secondary">Connect Wallet</Button>
  );
}

export default ConnectButton;