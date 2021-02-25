import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { createBrowserHistory } from "history";

import {
  Box,
  Typography,
} from "@material-ui/core";

import { AragonContext } from "contexts";

import { Vote } from "services/aragon/types";
import { 
  // VoteProposalButtons,
  ProposalItem
} from "components";
import useStyles from "components/Vote/VotesList/styles";

function VotesList() {  
  const classes = useStyles();
  const aragonContext = useContext<any | null>(AragonContext);
  const history = createBrowserHistory();
  const setVote = (vote: Vote) => {
    aragonContext.setVote(vote)
  }
  const navigateToProposalDetails = (vote: Vote, id: number) => {
    setVote(vote);
    console.log('vote', vote.id);
    const url =`/proposals/${id}`
    // const url = `/proposals/${id}`
    history.push(url);
    console.log('after history')
  }
  const voteItems = (vote: Vote, voteIndex: number) => {
    
    const id = vote.id.slice(61, vote.id.length)
    voteIndex = Number(id);
    return <ProposalItem vote={vote} voteIndex={voteIndex} key={voteIndex} onClick={()=>{ navigateToProposalDetails(vote, voteIndex)} } />
  }
  
  const votes = aragonContext.votes.map(voteItems).slice(0, 5)
  return (
    <>
      { 
        aragonContext.votes.length < 0 &&
        (
          <Typography variant="h5" className={classes.voteListTitle}>
            Loading vote proposals...
          </Typography>
        )
      }
      <Box>
        {
          votes
        }
      </Box>
      <Link to="/proposals" style={{ textDecoration: "none"}}>
        <Box display="flex" justifyContent="center" alignItems="center" padding="2.5%">
          <Typography variant="subtitle2" color="textSecondary">View All Proposals</Typography>
        </Box>
      </Link>
    </>
  );
}

export default VotesList;