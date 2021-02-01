import React, { useState } from "react";
import {
  Button,
  Box,

} from "@material-ui/core";

import useStyles from "components/Staking/StakingButton/styles";

function StakingButton(props?: any) {
  const classes = useStyles();
  const { amount } = props;
  const [submitting, setSubmitting] = useState(false);
  
  const stake = async () => {
    setSubmitting(true);
    console.log('Amount to stake thru props: ', amount);
    setTimeout(()=>{
      setSubmitting(false);
    }, 1000*5)
  }
  
  return (
    <Box className={classes.root}>
      <Button color="inherit" className={classes.root} onClick={stake}>
        { 
          submitting ? "Staking tokens..." : "Stake Tokens" 
        }
      </Button>
    </Box>
  );
}

export default StakingButton;