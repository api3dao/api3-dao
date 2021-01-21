import React from "react";
import { Link } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

import useStyles from "components/Navbar/styles";

function Sidebar() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography className={classes.title}>
            <Link to="/dashboard" className={classes.link}>
              Dashboard
            </Link>
          </Typography>
          <Typography className={classes.title}>
            <Link to="/proposals" className={classes.link}>
              Proposals
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Sidebar;