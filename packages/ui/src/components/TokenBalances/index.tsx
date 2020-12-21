import React, { useState, useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import { API3Context } from "contexts";
import { Counter } from "components";

import useStyles from "components/TokenBalances/styles";

function TokenBalances() {
  const api3Context = useContext(API3Context)
  const classes = useStyles();
  const [API3TokensSupply] = useState<number>(0)
  const [API3TokensStaked] = useState<number>(0);
  const tokenItem = (token: any, index: number) => { 
    return (
      <Box className={classes.box} key={index}>
        <Typography variant="subtitle1">
          { token.name }: { token.balance }
        </Typography>
      </Box>
    )
  }
  const TokensList = () => {
    return (
      <>
        <Box className={classes.box}>
          <Counter countDownDate="Jan 1, 2021 00:00:00" />
        </Box>
        <Box className={classes.box}>
          <Typography variant="subtitle1">
            API3 tokens supply: { API3TokensSupply }
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="subtitle1">
            API3 tokens staked: { API3TokensStaked }
          </Typography>
        </Box>
        {
          api3Context.tokens.map(tokenItem)
        }
      </>
    );
  }

  return <TokensList />
}

export default TokenBalances;
