import React from 'react';
import { Box, Typography } from '@material-ui/core';
import useStyles from "components/TokenBalances/styles";

function TokenBalances() {
  const classes = useStyles();
  return (
    <>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Total API3 tokens staked: { 0 }
        </Typography>
      </Box>

      <Box className={classes.box}>
        <Typography variant="subtitle1">
          API3 tokens balance: { 0 }
        </Typography>
      </Box>

      <Box className={classes.box}>
        <Typography variant="subtitle1">
          API3 staked tokens balance: { 0 }
        </Typography>
      </Box>

    </>
  );
}

export default TokenBalances;
