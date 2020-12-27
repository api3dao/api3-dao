import React, { useContext } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';

import { API3Context } from "contexts";
import { Account, Global } from "components/API3Stats";

import useStyles from "components/API3Stats/styles";

function API3Stats() {
  const classes = useStyles();
  const api3Context = useContext(API3Context);
  console.log('api3Context', api3Context);
  
  const LoadingAccountInfo = () => {
    return (
      <> 
        <Typography variant="h4">
          Connect Wallet
        </Typography>
      </>
    )
  }
  
  const Stats = () => {
    return (
      <Box className={classes.root}>
        <Grid container justify="space-evenly" spacing={2}>
          <Grid>
            <Global />
          </Grid>
          <Grid>
            <Account />
          </Grid>
        </Grid>

      </Box>
    )
  }
  
  const tokens = api3Context.tokens.length > 0;
  return tokens ? <Stats /> : <LoadingAccountInfo />;
}

export default API3Stats;
