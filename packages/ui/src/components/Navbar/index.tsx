import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

import { ConnectButton } from "components"

import useStyles from "components/Navbar/styles";

function Navbar() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            API3 DAO
          </Typography>
          <ConnectButton />
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;