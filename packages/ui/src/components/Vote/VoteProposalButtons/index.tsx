import React from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import { Voting } from "services/aragon";

import useStyles from "components/Vote/VoteProposalButtons/styles";

function VoteProposalButton(props: any) {
  const classes = useStyles();
  const { voteIndex, proposalType } = props
  
  const castVote = async (voteIndex: number, favor: boolean) => {
    // depending of ProposalType castVote is gonna have a different logic.
    const voting = await Voting.getInstance();
    console.log('voting', voting);
    if(proposalType === "vote") {
      voting.vote(voteIndex, favor);
    }
  }
  
  return (
    <Box>
      <Button color="primary" className={classes.button} onClick={() => castVote(voteIndex, true)}>Yes</Button>
      <Button color="primary" className={classes.button} onClick={() => castVote(voteIndex, false)}>No</Button>
    </Box>
  );
}

export default VoteProposalButton;