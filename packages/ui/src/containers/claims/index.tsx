import React from 'react';
import { Container } from '@material-ui/core';


import useStyles from "containers/claims/styles";

function Claims() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      Claims
    </Container>
  );
}

export default Claims;