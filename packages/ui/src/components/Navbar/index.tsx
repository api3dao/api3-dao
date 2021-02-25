import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Box,

} from "@material-ui/core";

import { ConnectButton, AddressInfo, Logo } from "components"
import { Web3Context } from "contexts"
import useStyles from "components/Navbar/styles";

import vector from "assets/icons/vector.png";

// This is used for now as Topbar 

function Navbar() {
  const classes = useStyles();
  const web3Context = useContext(Web3Context);
  const { address, disconnect } = web3Context;
  return (
    <Box className={classes.root}>
      <AppBar position="static" >
        <Toolbar className={classes.header}>
        <Link to="/">
          <Logo />
        </Link>
          {
            web3Context.address ? (
              <Box className={classes.addressContainer}>
                <img src={vector} alt="" className={classes.logo} />
                <AddressInfo address={address} disconnect={disconnect}/>
              </Box>
            ) : (
              <ConnectButton />
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;