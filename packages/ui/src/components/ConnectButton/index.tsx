import React from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@material-ui/core";

import useStyles from "components/Navbar/styles";

function ConnectButton() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <Button color="inherit">Connect Wallet</Button>
    </div>
  );
}

export default ConnectButton;