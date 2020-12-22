import React from 'react';
import { Container } from '@material-ui/core';


import useStyles from "containers/staking/styles";

function Staking() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      Staking
    </Container>
  );
}

export default Staking;