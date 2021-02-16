import React, { useContext, useEffect, useState } from 'react';
import { Container, Box, Typography } from '@material-ui/core';

import { Voting } from "services/aragon";
import { AragonContext } from "contexts"; 
import { VotesList, BasicButton, NewProposalModal } from "components";

import useStyles from "containers/dao-gov/styles";
import useCommonStyles from "styles/common-styles";
// This a Proposals Dashboard.
function DAOGov() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [newProposalModal, setProposalModal] = useState(false);
  const aragonContext = useContext<any>(AragonContext);
  
  const componentDidMount = () => {
    const getVotes = async () => {
      const voting = await Voting.getInstance();
      const votes = await voting.votes();
      aragonContext.setVotes(votes);
    }
    getVotes()
  }
  
  useEffect(componentDidMount, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <Container className={classes.root}>
       <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Proposals</Typography>
          <Box marginLeft="32px">
            <Typography variant="subtitle2" color="textSecondary">Proposals</Typography>
            <Typography variant="h2" color="secondary">Proposals</Typography>
          </Box>

      <Box display="flex" justifyContent="flex-end" marginTop="6%">
        <BasicButton color="black" title="New Proposal" onClick={() => setProposalModal(true)} />
      </Box>
      <Box className={commonClasses.borderContainer}>
        <VotesList />
      </Box>
      <NewProposalModal newProposalModal={newProposalModal} setProposalModal={setProposalModal}/>
    </Container>
  );
}

export default DAOGov;



// const aragonContext = useContext<any>(AragonContext);
// 
// const getVotes = async () => { 
//   const aragon = await Aragon.getInstance();
//   const votes = await aragon.votes();
//   aragonContext.setVotes(votes);
// }
// 
// const componentDidMount = () => {
//   getVotes()
// }
// useEffect(componentDidMount, []);