import React from 'react';
import { Container, Button } from '@material-ui/core';
import {
  TokenBalances,
  Actions,
  VotesList,
} from "components"

import useStyles from "containers/dashboard/styles";

function Dashboard() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <TokenBalances />
      <Actions />
      <VotesList />
    </Container>
  );
}

export default Dashboard;
