import React from "react";
import { NavLink } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
} from "@material-ui/core";

import useStyles from "components/Navbar/Sidebar/styles";
import vector from "assets/icons/vector.png";

function Sidebar() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar className={classes.bar}>
        <NavLink activeClassName={classes.activebar} to="/dashboard" className={classes.title}>
          <Typography variant="body1" className={classes.link}>
            <img src={vector} alt="" className={classes.logo} />
              Dashboard
          </Typography>
          </NavLink>
          <NavLink activeClassName={classes.activebar} to="/proposals" className={classes.title}>
          <Typography variant="body1" className={classes.link}>
            <img src={vector} alt="" className={classes.logo} />
              Proposals
          </Typography>
          </NavLink>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Sidebar;