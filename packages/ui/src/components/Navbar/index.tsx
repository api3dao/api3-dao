import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

import { ConnectButton, AddressInfo, Logo } from "components"
import { Web3Context } from "contexts"
import useStyles from "components/Navbar/styles";

function Navbar() {
  const classes = useStyles();
  const context = useContext(Web3Context)
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Logo />
          <Typography variant="h6" className={classes.title}>
            <Link to="/" className={classes.link}>
              API3 DAO
            </Link>
          </Typography>
          <Typography className={classes.title}>
            <Link to="/dashboard" className={classes.link}>
              Dashboard
            </Link>
          </Typography>
          <Typography className={classes.title}>
            <Link to="/staking" className={classes.link}>
              Staking
            </Link>
          </Typography>
          <Typography className={classes.title}>
            <Link to="/proposals" className={classes.link}>
              Proposals
            </Link>
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