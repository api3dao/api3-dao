import React, { useContext, useEffect } from 'react';
import { Container, Box, Typography } from '@material-ui/core';

import Aragon from "services/aragon";
import { AragonContext } from "contexts"; 
import { NewProposalButton, VotesList } from "components";

import useStyles from "containers/dao-gov/styles";

function DAOGov() {
  const classes = useStyles();
  const aragonContext = useContext<any>(AragonContext);
  

  
  const componentDidMount = () => {
    const getVotes = async () => { 
      const aragon = await Aragon.getInstance();
      const votes = await aragon.votes();
      aragonContext.setVotes(votes);
    }
    getVotes()
  }
  
  useEffect(componentDidMount, [aragonContext]);
  
  return (
    <Container className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h4">
          DAO Governance
        </Typography>
      </Box>
      <Box className={classes.box}>
        <NewProposalButton />
      </Box>
      <Box>
        <VotesList />
      </Box>
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