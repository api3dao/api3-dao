import React, { 
  // useContext, 
  // useEffect 
} from 'react';
import { Container } from '@material-ui/core';

// import Aragon from "services/aragon";
// import { AragonContext } from "contexts";

import useStyles from "containers/dashboard/styles";

function UserDashboard() {
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
      User Dashboard Similar to landing page
    </Container>
  );
}

export default UserDashboard;
