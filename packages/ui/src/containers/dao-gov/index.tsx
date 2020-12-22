import React from 'react';
import { Container } from '@material-ui/core';


import useStyles from "containers/dao-gov/styles";

function DAOGov() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      DAO GOV
    </Container>
  );
}

export default DAOGov;

