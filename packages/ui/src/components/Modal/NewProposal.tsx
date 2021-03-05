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
} from "@material-ui/core";
import NumberFormat from 'react-number-format';

import { BasicButton } from "components";
import { CloseIcon } from "components/@material-icons";
import { useStyles, CustomSelect }from "components/Modal/styles";

const styles = {
  font16: {
    fontSize: 16 
  }
}

function NewProposalModal(props: any) {
  const classes = useStyles();
  const [address, setAddress] = useState("");
  const [typeOfProposal, setTypeOfProposal ] = useState("type1");
  const [amount, setAmount] = useState(0);
  const [typeOfToken, setTypeOfToken ] = useState("usdc");
  const [linkInfo, setLinkInfo] = useState("");
  const [otherAddress, setOtherAddress] = useState("");
  const [parameter, setParameter] = useState("staketarget");
  const [stakeAmount, setStakeAmount] = useState("10000000");
  const [minAmountAPR, setMinAmountAPR] = useState(2.5);
  const [maxAmountAPR, setMaxAmountAPR] = useState(75);
  const [updateRateAPR, setUpdateRateAPR] = useState(1);
  const [voteWeightAmount, setVoteWeightAmount] = useState(0.1);
  const [unstakeWaitPeriod, setUnstakeWaitPeriod] = useState("7");
  const { setProposalModal, setDelegateAddress, newProposalModal } = props;

  const onClose = () => {
    setProposalModal(false);
  }

  const onChange = (event: any, setState: Function ) => {
    setState(event.target.value);
  }

  const onSubmit = () => {
    onClose();
    setDelegateAddress(address);
  }

  function NumberFormatCustom(props: any) {
    const { inputRef, onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        style={styles.font16}
        getInputRef={inputRef}
        allowNegative={false}
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        thousandSeparator
        suffix={" API3"}
        // isNumericString
      />
    );
  }
  
  function NumberFormatCustomDays(props: any) {
    const { inputRef, onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        style={styles.font16}
        getInputRef={inputRef}
        allowNegative={false}
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        suffix={" days"}
        // isNumericString
      />
    );
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
  
  function NumberFormatPercentage(props: any) {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        style={styles.font16}
        getInputRef={inputRef}
        allowNegative={false}
        allowLeadingZeros={false}
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        isAllowed={(values) => parseInt(values.value) <= 100}
        suffix={" %"}
        isNumericString
      />
    );
  }
  const proposalTypeStyles = (
    typeOfProposal === "type2" ? classes.newProposalType2 
    : typeOfToken === "other" ? classes.newProposalWithOther 
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
        <Box onClick={onClose} marginLeft="23%">
          <CloseIcon color="secondary" fontSize="large" />
        </Box>
        <Paper className={proposalTypeStyles}>
          <Box display="flex" alignContent="center" marginBottom="3vh">
            <Box display="flex" alignItems="center" justifyContent="center">
              <Typography variant="body2" color="primary">Proposal Type</Typography>
            </Box>
            <Box marginLeft="36px" width="174px">
              <Select
                  fullWidth
                  labelId="typeof-select-label"
                  id="typeof-select"
                  value={typeOfProposal}
                  onChange={(event) => onChange(event, setTypeOfProposal)}
                  input={<CustomSelect  />}
                  >
                  <MenuItem value={"type1"}>Transfer</MenuItem>
                  <MenuItem value={"type2"}>Update Parameters</MenuItem>
              </Select>
            </Box>
          </Box>
          {
            typeOfProposal === "type1" && (
              <Box>
                <Box display="flex" marginBottom="24px">
                  <Box paddingRight="6px">
                    <Typography variant="body2" color="primary">Recipient</Typography>
                  </Box>
                  { 
                    typeOfToken !== "other" && (
                      <Typography variant="body2" color="textSecondary">Must be a valid Ethereum address</Typography>
                    )
                  }
                </Box>
                <TextField 
                  required
                  onChange={(event) => onChange(event, setAddress)}  
                  placeholder="Enter recipient's address here" 
                  value={address}
                  className={classes.input}
                  InputProps={{ disableUnderline: true }}
                />
              <Box display="flex"  marginTop="36px" >
                  <Box width="65%" marginRight="24px">
                  <Typography variant="body2" color="primary">Amount</Typography>
                  <Box marginTop="24px">
                      <TextField 
                          required
                          onChange={(event) => onChange(event, setAmount)}  
                          placeholder="1234" 
                          value={amount}
                          className={classes.input}
                          InputProps={{ disableUnderline: true }}
                      />
                  </Box>
                </Box>
                <Box width="30vh">
                  <Typography variant="body2" color="primary">Token</Typography>
                  <Box marginTop="24px">
                  <Select
                      fullWidth
                      labelId="token-select-label"
                      id="token-select"
                      value={typeOfToken}
                      onChange={(e) => onChange(e, setTypeOfToken)}
                      input={<CustomSelect  />}
                      >
                      <MenuItem value={"usdc"}>USDC</MenuItem>
                      <MenuItem value={"eth"}>ETH</MenuItem>
                      <MenuItem value={"api3"}>API3</MenuItem>
                      <MenuItem value={"other"}>Other</MenuItem>
                  </Select>
                  </Box>
                </Box>
              </Box>
              {typeOfToken === "other" &&
              <Box marginBottom="24px" marginTop="28px">
                  <Box marginBottom="24px">
                      <Typography variant="body2" color="primary">Other Token Address</Typography>
                  </Box>
                  <TextField 
                      required
                      onChange={(event) => onChange(event, setOtherAddress)}  
                      placeholder="Enter token’s address" 
                      value={otherAddress}
                      className={classes.input}
                      InputProps={{ disableUnderline: true }}
                  />
              </Box>
              }
              <Box marginBottom="24px" marginTop="28px">
                  <Box marginBottom="24px">
                      <Typography variant="body2" color="primary">Reference</Typography>
                  </Box>
                  <TextField 
                      required
                      onChange={(event) => onChange(event, setLinkInfo)}  
                      placeholder="Link to more information" 
                      value={linkInfo}
                      className={classes.input}
                      InputProps={{ disableUnderline: true }}
                  />
              </Box>
              </Box>
            )
          }
          {
           typeOfProposal === "type2" && (
           <Box>
             <Box display="flex" marginBottom="2vh" alignContent="center">
               <Box paddingRight="3vh" display="flex">
                  <Typography variant="body2" color="primary">DAO Parameter to Update</Typography>
               </Box>
               <Box width="178px">
               <Select
                   fullWidth
                   labelId="stake-target-select-label"
                   id="stake-target-select"
                   value={parameter}
                   onChange={(event) => onChange(event, setParameter)}
                   input={<CustomSelect  />}>
                   <MenuItem value={"staketarget"}>Stake Target</MenuItem>
                   <MenuItem value={"minapr"}>Minimum APR</MenuItem>
                   <MenuItem value={"maxapr"}>Maximum APR</MenuItem>
                   <MenuItem value={"updateapr"}>APR Update Rate</MenuItem>
                   <MenuItem value={"voteweight"}>Voting Weight</MenuItem>
                   <MenuItem value={"unstakewaitperiod"}>Unstake Waiting Period</MenuItem>
               </Select>
               </Box>
             </Box>
           
             <Box marginTop="4vh" marginBottom="8vh" display="flex">
               <Box width="50%" display="flex" justifyContent="space-between" flexDirection="column">
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">Stake Target</Typography>
                   </Box>
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">Minimum APR</Typography>
                   </Box>
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">Maximum APR</Typography>
                   </Box>
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">APR Update Rate</Typography>
                   </Box>
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">Minimum Voting Weight to Create a Proposal</Typography>
                   </Box>
                   <Box marginBottom="4vh">
                     <Typography variant="body2" color="primary">Unstake Waiting Period</Typography>
                   </Box>
               </Box>
               <Box width="50%">
                 <Box marginBottom="4vh">
                     {
                     parameter === "staketarget" ? 
                      <TextField 
                       required
                       onChange={(event) => onChange(event, setStakeAmount)}  
                       placeholder="10,000,000" 
                       value={stakeAmount}
                       className={classes.input}
                       InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustom, autoFocus: true }}
                     /> : (
                       <Typography variant="body2" color="primary">
                         <NumberFormat value={stakeAmount} displayType={'text'} thousandSeparator={true} suffix={' API3'} />
                         </Typography>
                       )
                     }
                 </Box>
                   
                 <Box marginBottom="4vh">
                 {parameter === "minapr" ? 
                 <Box width="12vh">
                    <TextField 
                     required
                     onChange={(event) => onChange(event, setMinAmountAPR)}  
                     placeholder={"2.5"}
                     value={minAmountAPR}
                     className={classes.input}
                     InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage,  autoFocus: true, }}
                   />
                   </Box>
                    :
                   <Typography variant="body2" color="primary">{minAmountAPR}%</Typography>}
                 </Box>
                   
                 <Box marginBottom="4vh">
                 {parameter === "maxapr" ? 
                 <Box width="12vh">
                    <TextField 
                     required
                     onChange={(event) => onChange(event, setMaxAmountAPR)}  
                     placeholder={"75"}
                     value={maxAmountAPR}
                     className={classes.input}
                     InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true }}
                   />
                   </Box>
                    :
                   <Typography variant="body2" color="primary">{maxAmountAPR}%</Typography>}
                 </Box>
                 
                 <Box marginBottom="4vh">
                 {parameter === "updateapr" ? 
                    <TextField 
                     required
                     onChange={(event) => onChange(event, setUpdateRateAPR)}  
                     placeholder="1" 
                     value={updateRateAPR}
                     className={classes.input}
                     InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true }}
                   /> : (
                      <Typography variant="body2" color="primary">
                        {updateRateAPR}%
                      </Typography>
                    )
                  }
                 </Box>
                   
                 <Box marginBottom="4vh">
                   {
                    parameter === "voteweight" ? (
                      <Box width="12vh">
                         <TextField 
                          required
                          onChange={(event) => onChange(event, setVoteWeightAmount)}  
                          placeholder={"0.1"}
                          value={voteWeightAmount}
                          className={classes.input}
                          InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage, autoFocus: true }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="primary">
                       { voteWeightAmount }%
                      </Typography>
                    )
                   }
                 </Box>

                 <Box marginBottom="4vh">
                   {
                   parameter === "unstakewaitperiod" ? 
                    <TextField 
                     required
                     onChange={(event) => onChange(event, setUnstakeWaitPeriod)}  
                     placeholder="7" 
                     value={unstakeWaitPeriod}
                     className={classes.input}
                     InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustomDays, autoFocus: true }}
                   /> : (
                     <Typography variant="body2" color="primary">
                       <NumberFormat value={unstakeWaitPeriod} displayType={'text'}  suffix={' days'} />
                      </Typography>
                     )
                   }
                 </Box> 
               </Box>
             </Box>
           
             <Box marginBottom="2vh">
               <Box marginBottom="2vh">
                  <Typography variant="body2" color="primary">Reference</Typography>
               </Box>
               <TextField 
                 required
                 onChange={(event) => onChange(event, setLinkInfo)}  
                 placeholder="Link to more information" 
                 value={linkInfo}
                 className={classes.input}
                 InputProps={{ disableUnderline: true }}
               />
             </Box>
           </Box>
           )
          }
          <Box display="flex" justifyContent="flex-end">
            <BasicButton title="Submit Proposal" color="white" onClick={() => onSubmit()} />
          </Box> 
        </Paper>
      </Box>
    </Modal>
  );
}

export default NewProposalModal;