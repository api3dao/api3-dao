import React from 'react';
import { Container } from '@material-ui/core';

import useStyles from "containers/proposals/styles";

function Proposals() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      Proposals
    </Container>
  );
}

export default Proposals;
