import React, {
  useState,
} from "react";
import {
  Typography,
  Modal,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  Grid,
} from "@material-ui/core";
import NumberFormat from 'react-number-format';
import {
  NumberFormatSimple,
  NumberFormatPercentage,
  NumberFormatCustom,
  NumberFormatCustomDays
} from 'components/Input/Number';

import { BasicButton } from "components";
import { CloseIcon } from "components/@material-icons";
import { useStyles, CustomSelect }from "components/Modal/styles";

function NewProposalModal(props: any) {
  const classes = useStyles();
  const [data, setData] = useState({
    address: '',
    typeOfProposal: 'transfer',
    amount: 0,
    typeOfToken: 'usdc',
    linkInfo: '',
    otherAddress: '',
    parameter: 'staketarget',
    stakeAmount: '',
    minAmountAPR: 0,
    maxAmountAPR: 0,
    updateRateAPR: 0,
    voteWeightAmount: 0,
    unstakeWaitPeriod: 0,
  });
  const { setProposalModal, setDelegateAddress, newProposalModal } = props;

  const onClose = () => {
    setProposalModal(false);
  }

  const handleChange = (event: any ) => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    });
  }

  const onSubmit = () => {
    onClose();
    setDelegateAddress && setDelegateAddress(data.address);
  }

  // MAX Button not needed atm.
  // const maxButtonStyles = { textDecoration: "underline", cursor: "pointer", marginLeft: "-50px" }
  // const MaxButton = (
  //   <Typography 
  //     variant="body2" 
  //     color="primary" 
  //     style={maxButtonStyles}
  //   >
  //     MAX
  //   </Typography>
  // );

  const proposalTypeStyles = (
    data.typeOfProposal === "updateParameters" ? classes.newProposalUpdateParameters 
    : data.typeOfToken === "other" ? classes.newProposalWithOther 
    : classes.newProposal
  )
  
  return (
    <Modal
      open={newProposalModal}
      onClose={onClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height="100%">
        <Paper className={proposalTypeStyles} style={{padding: '5px 0px', background: 'transparent', height: 40}}>
            <CloseIcon onClick={onClose} color="secondary" fontSize="large" style={{cursor: 'pointer', float: 'right'}} />
        </Paper>
        <Paper className={proposalTypeStyles}>
          <Grid container className={classes.grid}>
            <Grid style={{alignItems: 'center', display: 'flex'}} item xs={12}>
              <Typography variant="body2" color="primary">Proposal Type</Typography>
              <Select
                  style={{ marginLeft: '20px', width: '175px'}}
                  labelId="typeof-select-label"
                  id="typeof-select"
                  value={data.typeOfProposal}
                  name="typeOfProposal"
                  onChange={handleChange}
                  input={<CustomSelect  />}
              >
                  <MenuItem value={"transfer"}>Transfer</MenuItem>
                  <MenuItem value={"updateParameters"}>Update Parameters</MenuItem>
              </Select>
            </Grid>
          </Grid>
          {
            data.typeOfProposal === "transfer" ? (
              <Box>
                <Grid container className={classes.grid}>
                  <Grid item xs={12} style={{display: 'flex'}} className={classes.gridItems}>
                    <Typography variant="body2" color="primary">Recipient</Typography>
                    { data.typeOfToken !== "other" && ( <Typography variant="body2" color="textSecondary">Must be a valid Ethereum address</Typography> ) }
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      required
                      onChange={handleChange}  
                      placeholder="Enter recipient's address here" 
                      value={data.address}
                      name='address'
                      className={classes.input}
                      InputProps={{ disableUnderline: true }}
                    />
                  </Grid>
                </Grid>
                
                {/* Labels */}
                <Grid container className={classes.grid}>
                  <Grid item xs={8}>
                    <Typography variant="body2" color="primary">Amount</Typography>
                  </Grid>
                  <Grid item xs={1}></Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="primary">Token</Typography>
                  </Grid>
                </Grid>

                {/* Inputs */}
                <Grid container className={classes.grid}>
                  <Grid item xs={8}>
                    <TextField 
                        required
                        onChange={handleChange}  
                        placeholder="1234" 
                        value={data.amount}
                        name="amount"
                        className={classes.input}
                        InputProps={{ disableUnderline: true }}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>
                  <Grid item xs={3}>
                    <Select
                        fullWidth
                        labelId="token-select-label"
                        id="token-select"
                        value={data.typeOfToken}
                        name="typeOfToken"
                        onChange={handleChange}
                        input={<CustomSelect  />}
                        >
                        <MenuItem value={"usdc"}>USDC</MenuItem>
                        <MenuItem value={"eth"}>ETH</MenuItem>
                        <MenuItem value={"api3"}>API3</MenuItem>
                        <MenuItem value={"other"}>Other</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                {
                  data.typeOfToken === "other" && 
                  <Grid container className={classes.grid}>
                    <Grid item xs={12} className={classes.gridItems}>
                      <Typography variant="body2" color="primary">Other Token Address</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                          required
                          onChange={handleChange}  
                          placeholder="Enter token’s address" 
                          value={data.otherAddress}
                          name="otherAddress"
                          className={classes.input}
                          InputProps={{ disableUnderline: true }}
                      />
                    </Grid>
                  </Grid>
                }
              </Box>
            ) : (
              <Box>
                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="primary">DAO Parameter to Update</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Select
                        style={{width: '175px'}}
                        labelId="stake-target-select-label"
                        id="stake-target-select"
                        value={data.parameter}
                        name="parameter"
                        onChange={handleChange}
                        input={<CustomSelect  />}>
                        <MenuItem value={"staketarget"}>Stake Target</MenuItem>
                        <MenuItem value={"minapr"}>Minimum APR</MenuItem>
                        <MenuItem value={"maxapr"}>Maximum APR</MenuItem>
                        <MenuItem value={"updateapr"}>APR Update Rate</MenuItem>
                        <MenuItem value={"voteweight"}>Voting Weight</MenuItem>
                        <MenuItem value={"unstakewaitperiod"}>Unstake Waiting Period</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="primary">Stake Target</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {
                      data.parameter === "staketarget" ? 
                      <TextField 
                        required
                        onChange={handleChange}  
                        placeholder="10,000,000" 
                        value={data.stakeAmount}
                        name="stakeAmount"
                        className={classes.input}
                        InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustom, autoFocus: true}}
                      /> : (
                        <Typography variant="body2" color="primary">
                          <NumberFormat value={data.stakeAmount} displayType={'text'} thousandSeparator={true} suffix={' API3'} />
                          </Typography>
                        )
                      }
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="primary">Minimum APR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {data.parameter === "minapr" ? 
                    <Box width="12vh">
                      <TextField 
                        required
                        onChange={handleChange}  
                        placeholder={"2.5"}
                        value={data.minAmountAPR}
                        name="minAmountAPR"
                        className={classes.input}
                        InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true }}
                      />
                      </Box>
                      :
                      <Typography variant="body2" color="primary">{data.minAmountAPR}%</Typography>}
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="primary">Maximum APR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {data.parameter === "maxapr" ? 
                    <Box width="12vh">
                      <TextField 
                        required
                        onChange={handleChange}  
                        placeholder={"75"}
                        value={data.maxAmountAPR}
                        name="maxAmountAPR"
                        className={classes.input}
                        InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true }}
                      />
                      </Box>
                      :
                      <Typography variant="body2" color="primary">{data.maxAmountAPR}%</Typography>}
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="primary">APR Update Rate</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {data.parameter === "updateapr" ? 
                      <TextField 
                        required
                        onChange={handleChange}  
                        placeholder="1,000,000" 
                        value={data.updateRateAPR}
                        name="updateRateAPR"
                        className={classes.input}
                        InputProps={{ disableUnderline: true, inputComponent: NumberFormatSimple, autoFocus: true }}
                      /> : <Typography variant="body2" color="primary"><NumberFormat value={data.updateRateAPR} displayType={'text'} thousandSeparator={true} /></Typography>
                      }
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography style={{width: '185px'}} variant="body2" color="primary">Minimum Voting Weight to Create a Proposal</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {data.parameter === "voteweight" ? 
                    <Box width="12vh">
                      <TextField 
                        required
                        onChange={handleChange}  
                        placeholder={"0.1"}
                        value={data.voteWeightAmount}
                        name="voteWeightAmount"
                        className={classes.input}
                        InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true}}
                      />
                      </Box>
                      :
                      <Typography variant="body2" color="primary">{data.voteWeightAmount}%</Typography>}
                  </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                  <Grid item xs={6}>
                    <Typography style={{width: '185px'}} variant="body2" color="primary">Unstake Waiting Period</Typography>
                  </Grid>
                  <Grid item xs={6}>
                      { data.parameter === "unstakewaitperiod" ?
                      <Box width="12vh">
                        <TextField 
                          required
                          onChange={handleChange}  
                          placeholder="7"
                          value={data.unstakeWaitPeriod}
                          name="unstakeWaitPeriod"
                          className={classes.input}
                          InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustomDays, autoFocus: true }}
                        />
                      </Box>
                      :
                      <Typography variant="body2" color="primary"> <NumberFormat value={data.unstakeWaitPeriod} displayType={'text'}  suffix={' days'} /></Typography>}
                  </Grid>
                </Grid>
              </Box>
            )
          }

          <Grid container className={classes.grid}>
            <Grid item xs={12} style={{marginBottom: '15px'}}>
              <Typography variant="body2" color="primary">Reference</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                onChange={handleChange}  
                placeholder="Link to more information" 
                value={data.linkInfo}
                name="linkInfo"
                className={classes.input}
                InputProps={{ disableUnderline: true }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end">
            <BasicButton title="Submit Proposal" color="white" onClick={() => onSubmit()} />
          </Box> 
        </Paper>
      </Box>
    </Modal>
  );
}

export default NewProposalModal;