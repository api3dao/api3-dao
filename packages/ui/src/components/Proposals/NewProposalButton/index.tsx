import React from "react";
import {
  Button,
} from "@material-ui/core";

import { ProposalModal } from "components";

import useStyles from "components/Proposals/NewProposalButton/styles";

function SetStakingTargetButton() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = async () => {
    setOpen(true);
  };
 
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <div className={classes.root}>
      <Button color="inherit" className={classes.root} onClick={()=> handleOpen() } >New Proposal</Button>
      <ProposalModal handleClose={handleClose} open={open} />
    </div>
  );
}

export default SetStakingTargetButton;