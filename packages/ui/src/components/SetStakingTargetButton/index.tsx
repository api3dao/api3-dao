import React from "react";
import {
  Button,
} from "@material-ui/core";

import useStyles from "components/Navbar/styles";

function SetStakingTargetButton() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <Button color="inherit">Set Staking Target</Button>
    </div>
  );
}

export default SetStakingTargetButton;