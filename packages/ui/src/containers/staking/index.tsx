import React, { useState, useContext } from 'react';
import { Container, Box,  Typography, InputLabel, Input } from '@material-ui/core';

import { API3Context } from "contexts";
import { StakingButton } from "components"; 
import useStyles from "containers/staking/styles";

function Staking() {
  const classes = useStyles();
  const api3Context = useContext(API3Context)
  const [amount, setAmount] = useState<number>(0);
  const onChangeAmount = (event: any) => {
    const { value } = event.target;
    setAmount(value);
  }
  return (
    <Container className={classes.root}>
      <Box className={classes.box}>
        <Typography variant="h6">
          Staking Balance: { api3Context.tokens[1] ? api3Context.tokens[1].balance : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="h6">
          How much you want to stake?
        </Typography>
      </Box>
      <Box className={classes.box}>
        <InputLabel htmlFor="target-amout">Amount: { amount }</InputLabel>
        <Input 
          id="target-amout" 
          type="number" 
          onChange={onChangeAmount}
        />
      </Box>
      <Box className={classes.box}>
        <StakingButton amount={amount} />
      </Box>
    </Container>
  );
}

export default Staking;