import React, { 
  // useContext, 
  // useEffect 
} from 'react';
import { Container, Typography } from '@material-ui/core';

// import Aragon from "services/aragon";
// import { AragonContext } from "contexts";

import useStyles from "containers/dashboard/styles";

function Dashboard() {
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
      <Typography variant="h6">Landing Page before user connects wallet.</Typography>
    </Container>
  );
}

export default Dashboard;
