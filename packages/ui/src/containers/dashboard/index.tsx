import React from 'react';
import { Container } from '@material-ui/core';
import {
  TokenBalances,
} from "components"

import useStyles from "containers/dashboard/styles";

function Dashboard() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <TokenBalances />
    </Container>
  );
}

export default Dashboard;
