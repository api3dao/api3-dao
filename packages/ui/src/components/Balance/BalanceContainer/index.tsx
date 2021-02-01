import React from 'react';
import { BasicButton } from "components"

import { Typography, Box } from '@material-ui/core';

import useStyles from "components/Balance/BalanceContainer/styles";
import useCommonStyles from "styles/common-styles";

function BalanceContainer() { 
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  return (
    <Box marginTop="6%" width="50%" marginRight="10%" >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" color="secondary">Balance</Typography>
        <BasicButton color="black" title="+ Deposit" />
      </Box>
      <Box className={commonClasses.borderContainer} padding="5%"> 
        <Box className={classes.paddingBox} display="flex" alignItems="center" justifyContent="center" flexDirection="column">
          <Typography variant="body1" color="textSecondary">Total</Typography>
          <Typography variant="h2" color="secondary">0</Typography>
          <Typography variant="body1" color="textSecondary" >Withdrawable</Typography>
          <Typography variant="h2" color="secondary">0</Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}}>Withdraw</Typography>
        </Box>
      </Box>
    </Box>
    )
}

export default BalanceContainer;