import React from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import { API3 } from "services/api3";
import useStyles from "components/ConnectButton/styles";

function API3Buttons() {
  const classes = useStyles();
  
  const print = async () => {
    const instance = await API3.getInstance();
    await instance.print();
  }
  
  const deposit = async () => {

  }
  
  const withdraw = async () => {
  
  }
  
  const stake = async () => {
  
  }
  
  const unstake = async () => {
  }
  
  const delegate = async () => {
  
  }
  
  const undelegate = async () => {
  
  }
  
  const vote = async () => {
  
  }
  
  const unvote = async () => {
  
  }
  
  const insurancepool = async () => {
  
  }

  return (
    <Box>
      <Button onClick={print} color="primary" className={classes.button}>Print</Button>
      <Button onClick={deposit} color="primary" className={classes.button}>Deposit</Button>
      <Button onClick={withdraw} color="primary" className={classes.button}>Withdraw</Button>
      <Button onClick={stake} color="primary" className={classes.button}>Stake</Button>
      <Button onClick={unstake} color="primary" className={classes.button}>Unstake</Button>
      <Button onClick={delegate} color="primary" className={classes.button}>Delegate</Button>
      <Button onClick={undelegate} color="primary" className={classes.button}>Undelegate</Button>
      <Button onClick={vote} color="primary" className={classes.button}>Vote</Button>
      <Button onClick={unvote} color="primary" className={classes.button}>Unvote</Button>
      <Button onClick={insurancepool} color="primary" className={classes.button}>Insurance pool</Button>
    </Box>
  );
}

export default API3Buttons;