import React, { useState, } from "react";
import {
  Box,
  Button,
  TextField,
} from "@material-ui/core";
import NumberFormat from 'react-number-format';

import { API3 } from "services/api3";

import { verifyProposalId } from "services/proposal/verifier";
// import { API3ContractAddresses } from "services/api3/addresses";
import useStyles from "components/testing/styles";

// const { API3Pool } = API3ContractAddresses;

const styles = {
  font16: {
    fontSize: 16,
    height: 0,
  }
}

function NumberFormatCustom(props: any) {
  const { inputRef, onChange, ...other } = props;
  const onChangeNumber = (values: any) => {
    const { value } = values;
    const toNumber = Number(value)
    onChange(toNumber);
  }
  return (
    <NumberFormat
      {...other}
      style={styles.font16}
      getInputRef={inputRef}
      allowNegative={false}
      onValueChange={onChangeNumber}
    />
  );
}

function API3Buttons() {
  const classes = useStyles();
  const [proposalSpecId, setProposalSpecId] = useState(0);
  
  const onChange = (event: any, setState: Function ) => {
    setState(event);
  }
  
  const print = async () => {
    const instance = await API3.getInstance();
    await instance.print();
  }
  
  const deposit = async () => {
    const instance = await API3.getInstance();
    await instance.deposit(30);
  }
  
  const withdraw = async () => {
    const instance = await API3.getInstance();
    await instance.withdrawal(28);
  }
  
  const stake = async () => {
    const instance = await API3.getInstance();
    await instance.stake(1);
  }
  
  const unstake = async () => {
    const instance = await API3.getInstance();
    await instance.unstake();
  }
  
  const scheduleUnstake = async () => {
    const instance = await API3.getInstance();
    await instance.scheduleUnstake(1);
  }
  
  const delegate = async () => {
    // const instance = await API3.getInstance();
  }
  
  const undelegate = async () => {
    // const instance = await API3.getInstance();
  }
  
  const vote = async () => {
  // const instance = await API3.getInstance();
  }
  
  const unvote = async () => {
    // const instance = await API3.getInstance();
  }
  
  const insurancepool = async () => {
    // const instance = await API3.getInstance();
  }
  
  const verifyProposal = async () => {
    verifyProposalId(proposalSpecId);
  }

  return (
    <Box style={{ color: 'red' }}>
      <Button onClick={print} color="primary" className={classes.button}>Print</Button>
      <Button onClick={deposit} color="primary" className={classes.button}>Deposit</Button>
      <Button onClick={withdraw} color="primary" className={classes.button}>Withdraw</Button>
      <Button onClick={stake} color="primary" className={classes.button}>Stake</Button>
      <Button onClick={scheduleUnstake} color="primary" className={classes.button}>Schedule Unstake</Button>
      <Button onClick={unstake} color="primary" className={classes.button}>Unstake</Button>
      <Button onClick={delegate} color="primary" className={classes.button}>Delegate</Button>
      <Button onClick={undelegate} color="primary" className={classes.button}>Undelegate</Button>
      <Button onClick={vote} color="primary" className={classes.button}>Vote</Button>
      <Button onClick={unvote} color="primary" className={classes.button}>Unvote</Button>
      <Button onClick={insurancepool} color="primary" className={classes.button}>Insurance pool</Button>
      <Button onClick={verifyProposal} color="primary" className={classes.button}>Verify Proposal #{ proposalSpecId } </Button>
      <TextField 
       required
       onChange={(event) => onChange(event, setProposalSpecId)}  
       placeholder="1,000,000" 
       value={proposalSpecId}
       className={classes.input}
       InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustom, autoFocus: true }}
      />
    </Box>
  );
}

export default API3Buttons;