import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

import { ConnectButton, AddressInfo } from "components"
import { Web3Context } from "contexts"
import useStyles from "components/Navbar/styles";

function Navbar() {
  const classes = useStyles();
  const context = useContext(Web3Context)
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            API3 DAO
          </Typography>
          {
            context.address ? (
              <AddressInfo address={context.address}/>
            ) : (
              <ConnectButton />
            )
          }
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;