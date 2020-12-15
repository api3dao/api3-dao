import React from "react";
import {
  Button,
} from "@material-ui/core";

import { ProposalModal } from "components";

// import Aragon from "services/aragon";

import useStyles from "components/Staking/SetStakingTargetButton/styles";

function SetStakingTargetButton() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = async () => {
    // const aragon = await Aragon.getInstance()
    // aragon.newVote();
    setOpen(true);
  };
 
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <div className={classes.root}>
      <Button color="inherit" className={classes.root} onClick={()=> handleOpen() } >Create Staking Target Vote</Button>
      <ProposalModal handleClose={handleClose} open={open} />
    </div>
  );
}

export default SetStakingTargetButton;