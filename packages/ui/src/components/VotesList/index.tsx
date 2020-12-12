import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
} from "@material-ui/core";

import Aragon from "services/aragon";
import { Votes, Vote } from "services/aragon/types";
import { VoteProposalButtons } from "components";
import useStyles from "components/VotesList/styles";

function VotesList() {  
  const classes = useStyles()
  const [votes, setVotes] = useState<Votes>([]);
  
  const getVotes = async () => { 
    const aragon = await Aragon.getInstance();
    setVotes(await aragon.votes());
  }
  
  const componentDidMount = () => {
    getVotes()
  }
  
  useEffect(componentDidMount, []);
  
  const voteItems = (vote: Vote, voteIndex: number) => {
    voteIndex = Number(vote.id.slice(- 4))
    return (
      <Box className={classes.voteItem} key={voteIndex}>
        <Box>
          <p>Vote #: { voteIndex }</p>
          <p>Vote ID: { vote.id.slice(- 4) }</p>
        </Box>
        <Box>
          <p>Description of Vote: { vote.metadata }</p>
        </Box>
        <VoteProposalButtons voteIndex={voteIndex} />
      </Box>
    )
  }
    
  return (
    <Box>
      { 
        votes.length > 0 ? (
          <Typography variant="subtitle1" className={classes.voteListTitle}>
            Vote List
          </Typography>
        )
        : (
          <Typography variant="subtitle1" className={classes.voteListTitle}>
            Loading vote proposals...
          </Typography>
        )
      }
      {
        votes.map(voteItems).slice(0, 5)
      }
    </Box>
  );
}

export default VotesList;