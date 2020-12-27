import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import { API3Context } from "contexts";

import useStyles from "components/API3Stats/styles";

function Account() {
  const api3Context = useContext(API3Context)
  const classes = useStyles();
  
  const LoadingAccountInfo = () => {
    return (
      <> 
        <Typography variant="h4">
          Connect Wallet
        </Typography>
      </>
    )
  }
  
  const accountsStatsItem = (token: any, index: number) => {
    return (
      <Box className={classes.box} key={index}>
        <Typography variant="subtitle1">
          { token.name }: { token.balance }
        </Typography>
      </Box>
    )
  }
  
  const AccountStatsList = () => {
    // Account dashboard (total API3 tokens, tokens staked, withdrawable tokens, locked rewards, tokens locked for collateral)
    return (
      <Box className={classes.root}>
        <Box className={classes.box}>
          {
            api3Context.tokens.length > 0 && (
              <Typography variant="h4">
                Account Balances
              </Typography>
            )
          }
        </Box>
        {
          api3Context.tokens.map(accountsStatsItem)
        }
        <Box className={classes.box}>
          <Typography variant="subtitle1">
            Withdrawable Tokens: { 10 }
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="subtitle1">
            Locked Rewards Tokens: { 10 }
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Typography variant="subtitle1">
            Locked Tokens for Collateral: { 10 }
          </Typography>
        </Box>
      </Box>
    );
  }
  
  const tokens = api3Context.tokens.length > 0;
  return tokens ? <AccountStatsList /> : <LoadingAccountInfo />;
}

export default Account;
