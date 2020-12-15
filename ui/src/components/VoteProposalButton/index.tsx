import React from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import Aragon from "services/aragon";

import useStyles from "components/VoteProposalButton/styles";

function VoteProposalButton(props: any) {
  const classes = useStyles();
  const { voteIndex } = props
  
  const castVote = async (voteIndex: number, favor: boolean) => {
    const aragon = await Aragon.getInstance();
    aragon.vote(voteIndex, favor);
  }

  return (
    <Box>
      <Button className={classes.button} onClick={() => castVote(voteIndex, true)} color="inherit">Yes</Button>
      <Button className={classes.button} onClick={() => castVote(voteIndex, false)} color="inherit">No</Button>
    </Box>
  );
}

export default VoteProposalButton;