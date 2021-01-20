import React, { 
  // useContext, 
  // useEffect 
} from 'react';
import { Container } from '@material-ui/core';

// import Aragon from "services/aragon";
// import { AragonContext } from "contexts";

import useStyles from "containers/dashboard/styles";

function ProposalDetails() {
  const classes = useStyles();
  // const aragonContext = useContext<any>(AragonContext);

  // const componentDidMount = () => {
  //   const getVotes = async () => { 
  //     const aragon = await Aragon.getInstance();
  //     const votes = await aragon.votes();
  //     aragonContext.setVotes(votes);
  //   }
  //   getVotes()
  // }
  // useEffect(componentDidMount, [aragonContext]);
  
  return (
    <Container className={classes.root}>
      Here we display details of and individual proposals. 
      
      User here will vote for proposal either "For" or "Against" or Change Vote.
      
      Delegate voting to another address(popup).
    </Container>
  );
}

export default ProposalDetails;
