import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
} from "@material-ui/core";

import { AragonContext } from "contexts";

import { Vote } from "services/aragon/types";
import { 
  VoteProposalButtons,
  // Counter,

} from "components";
import useStyles from "components/VotesList/styles";

function VotesList() {  
  const classes = useStyles()
  const aragonContext = useContext<any | null>(AragonContext);
  
  const voteItems = (vote: Vote, voteIndex: number) => {
    voteIndex = Number(vote.id.slice(- 4))
    return (
      <Box className={classes.voteItem} key={voteIndex}>
        <Link to={`proposals/${voteIndex}`}>
          <Box>
            <Typography variant="body1">Vote #: { voteIndex }</Typography>
            <Typography variant="body1">Vote ID: { vote.id.slice(- 4) }</Typography>
          </Box>
          <Box>
            <Typography variant="body1">Description of Vote:</Typography>
            <Typography variant="body1"> { vote.metadata } </Typography>
          </Box>
          {/*
          <Box>
            <Counter countDownDate="Jan 1, 2021 00:00:00" />
          </Box>
          */}
        </Link>
        <VoteProposalButtons voteIndex={voteIndex} proposalType="vote"/>
      </Box>
    )
  }
    
  return (
    <>
      { 
        aragonContext.votes.length > 0 ? (
          <Typography variant="h5" className={classes.voteListTitle}>
            Vote List
          </Typography>
        )
        : (
          <Typography variant="h5" className={classes.voteListTitle}>
            Loading vote proposals...
          </Typography>
        )
      }
      <Box>
        {
          aragonContext.votes.map(voteItems).slice(0, 5)
        }
      </Box>

    </>
  );
}

export default VotesList;