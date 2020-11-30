import React from 'react';
import { Container } from '@material-ui/core';
import {
  TokenBalances,
  Actions,

} from "components"
import useStyles from "containers/dashboard/styles";

function Dashboard() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <TokenBalances />
      <Actions />
    </Container>
  );
}

export default Dashboard;
