import React, { useContext } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';

import { API3Context } from "contexts";

import useStyles from "components/API3Stats/styles";

function API3InsuranceStats() {
  const classes = useStyles();
  const api3Context = useContext(API3Context);

  const LoadingInsuranceStats = () => {
    return (
      <> 
        <Typography variant="h4">
          Loading Insurance Stats
        </Typography>
      </>
    )
  }
  const Stats = () => {
    return (
      <Box className={classes.root}>
        <Grid container justify="space-evenly" spacing={2}>
          Insurance Stats
        </Grid>
      </Box>
    )
  }
  
  const insuranceStats = api3Context.tokens.length > 0;
  return insuranceStats ? <Stats /> : <LoadingInsuranceStats />
}

export default API3InsuranceStats;
