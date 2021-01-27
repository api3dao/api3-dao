import React, { useContext } from 'react';
import { 
  Box, 
  Typography, 
  // Grid,
} from '@material-ui/core';
import { InsurancePool, BalanceContainer, StakingContainer  } from "components";

import { API3Context } from "contexts";
// import { Account, Global } from "components/API3Stats";

import useStyles from "components/API3Stats/styles";
import useCommonStyles from "styles/common-styles";

function API3Stats() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
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
        <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Dashboard</Typography>
          <div className={commonClasses.mainTitleContainer}>
            <Typography variant="subtitle2" color="textSecondary" style={{ color: "#878888" }}>Dashboard</Typography>
            <Typography variant="h2" color="secondary">User Address</Typography>
          </div>
          <div className={commonClasses.marginContainer}>
            <InsurancePool walletConnected />
          </div>
          <div style={{ display: "flex" }}>
            <BalanceContainer />
            <StakingContainer />
          </div>
        {/* <Grid container justify="space-evenly" spacing={2}>
          <Grid>
            <Global />
          </Grid>
          <Grid>
            <Account />
          </Grid>
        </Grid> */}

      </Box>
    )
  }
  
  const tokens = api3Context.tokens.length > 0;
  return tokens ? <Stats /> : <LoadingAccountInfo />;
}

export default API3Stats;