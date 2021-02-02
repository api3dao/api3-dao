import React, { useContext, useState } from 'react';
import { 
  Box, 
  Typography,

} from '@material-ui/core';
import { InsurancePool, BalanceContainer, StakingContainer, BasicButton  } from "components";

import { API3Context } from "contexts";
// import { Account, Global } from "components/API3Stats";

import useStyles from "components/API3Stats/styles";
import useCommonStyles from "styles/common-styles";

function API3Stats() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const api3Context = useContext(API3Context);
  console.log('api3Context', api3Context);
  const [unstakeTime, setUnstakeTime] = useState(0);
  const [unstakeAvailable, setUnstakeAvailable] = useState(true);
  const [unstakeTimeAvailable, setUnstakeTimeAvailable] = useState(0);
  const [unstakeStatus, setUnstakeStatus] = useState(true);
  const [actualUnstakeAmount, setActualUnstakeAmount ] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState(0);
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
          <Box marginLeft="32px">
            <Typography variant="subtitle2" color="textSecondary">Dashboard</Typography>
            <Typography variant="h2" color="secondary">User Address</Typography>
          </Box>
          { 
            unstakeAvailable && (
              <Box 
                display="flex" 
                padding="18px 24px" 
                justifyContent="space-between" 
                alignItems="center" 
                marginTop="6%" 
                className={classes.unstakeAvailableContainer}  
              >
                <Typography variant="body1" color="secondary">Your tokens are ready to be unstaked.</Typography>
                <Typography variant="body1" color="secondary" style={{ fontWeight: 200 }}>Unstake within 5 days 15 hours.</Typography>
                <BasicButton color="black" title="Unstake" />
              </Box>
            )
          }
          <div className={commonClasses.marginContainer}>
            <InsurancePool walletConnected />
          </div>
          <Box display="flex">
            <BalanceContainer />
            <StakingContainer 
              unstakeTime={unstakeTime}
              setUnstakeTime={setUnstakeTime} 
              unstakeAvailable={unstakeAvailable} 
              setUnstakeAvailable={setUnstakeAvailable}
              unstakeTimeAvailable={unstakeTimeAvailable}
              setUnstakeTimeAvailable={setUnstakeTimeAvailable}
              unstakeStatus={unstakeStatus}
              setUnstakeStatus={setUnstakeStatus}
              actualUnstakeAmount={actualUnstakeAmount}
              setActualUnstakeAmount={setActualUnstakeAmount}
              unstakeAmount={unstakeAmount}
              setUnstakeAmount={setUnstakeAmount}
            />
          </Box>
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