import React, { useContext } from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import { Web3 } from "services/web3"
import { Web3Context } from "contexts";

// import useStyles from "components/Navbar/styles";

function ConnectButton() {
  // const classes = useStyles();
  const context = useContext(Web3Context);
  const connect = async () => {
    const instance = await Web3.getInstance();
    const address = await instance.getDefaultAddress();
    context.setAddress(address);
  }
  
  return (
    <Box>
      <Button onClick={connect} color="secondary">Connect</Button>
    </Box>
  );
}

export default ConnectButton;