import React from 'react';
import { Box, Typography } from '@material-ui/core';
import useStyles from "components/TokenBalances/styles";

function TokenBalances() {
  const classes = useStyles();
  return (
    <>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          total API Tokens staked: { 0 }
        </Typography>
      </Box>

      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Your API3 token balance: { 0 }
        </Typography>
      </Box>

      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Your API staked token balance: { 0 }
        </Typography>
      </Box>

    </>
  );
}

export default TokenBalances;
