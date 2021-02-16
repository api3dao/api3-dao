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


function NewProposalModal(props: any) {
  const classes = useStyles();
  const [address, setAddress] = useState("");
  const [typeOfProposal, setTypeOfProposal ] = useState("type1");
  const [amount, setAmount] = useState(0);
  const [typeOfToken, setTypeOfToken ] = useState("usdc");
  const [linkInfo, setLinkInfo] = useState("");
  const [otherAddress, setOtherAddress] = useState("");
  const [stakeTarget, setStakeTarget] = useState("staketarget");
  const [stakeAmount, setStakeAmount] = useState("10000000");
  const [minAmountAPR, setMinAmountAPR] = useState(2.5);
  const [maxAmountAPR, setMaxAmountAPR] = useState(75);
  const [updateRateAPR, setUpdateRateAPR] = useState("1000000");
  const [voteWeightAmount, setVoteWeightAmount] = useState(0.1);

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

  function NumberFormatPercentage(props: any) {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
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
        <Paper className={typeOfProposal === "type2" ? classes.newProposalType2 : 
        typeOfToken === "other" ? classes.newProposalWithOther : classes.newProposal}>
          <Box  display="flex" alignContent="center" marginBottom="56px">
              <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body1" color="primary">Proposal Type</Typography>
              </Box>
           <Box marginLeft="36px" width="174px">
              <Select
                  fullWidth
                  labelId="typeof-select-label"
                  id="typeof-select"
                  value={typeOfProposal}
                  onChange={(e) => onChange(e, setTypeOfProposal)}
                  input={<CustomSelect  />}
                  >
                  <MenuItem value={"type1"}>Type 1</MenuItem>
                  <MenuItem value={"type2"}>Type 2</MenuItem>
              </Select>
          </Box>
          </Box>
          {typeOfProposal === "type1" ? 
          <Box>
            <Box display="flex" marginBottom="24px">
              <Box paddingRight="6px">
                  <Typography variant="body1" color="primary">Recipient</Typography>
              </Box>
              {typeOfToken !== "other" && <Typography variant="body1" color="textSecondary">  Must be a valid Ethereum address</Typography>}
          </Box>
            <TextField 
              required
              onChange={(e) => onChange(e, setAddress)}  
              placeholder="Enter user’s address here" 
              value={address}
              className={classes.input}
              InputProps={{ disableUnderline: true }}
            />
          <Box display="flex"  marginTop="36px" >
              <Box width="65%" marginRight="24px">
              <Typography variant="body1" color="primary">Amount</Typography>
              <Box marginTop="24px">
                  <TextField 
                      required
                      onChange={(e) => onChange(e, setAmount)}  
                      placeholder="1234" 
                      value={amount}
                      className={classes.input}
                      InputProps={{ disableUnderline: true }}
                  />
              </Box>
            </Box>
            <Box width="30%">
              <Typography variant="body1" color="primary">Token</Typography>
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
                  <Typography variant="body1" color="primary">Other Token Address</Typography>
              </Box>
              <TextField 
                  required
                  onChange={(e) => onChange(e, setOtherAddress)}  
                  placeholder="Enter token’s address" 
                  value={otherAddress}
                  className={classes.input}
                  InputProps={{ disableUnderline: true }}
              />
          </Box>
          }
          <Box marginBottom="24px" marginTop="28px">
              <Box marginBottom="24px">
                  <Typography variant="body1" color="primary">Reference</Typography>
              </Box>
              <TextField 
                  required
                  onChange={(e) => onChange(e, setLinkInfo)}  
                  placeholder="Link to more information" 
                  value={linkInfo}
                  className={classes.input}
                  InputProps={{ disableUnderline: true }}
              />
          </Box>
          </Box>
          :
          <Box>
            <Box display="flex" marginBottom="24px" alignContent="center">
              <Box paddingRight="35px" display="flex">
                  <Typography variant="body1" color="primary">DAO Parameter to change</Typography>
              </Box>
              <Box width="178px">
              <Select
                  fullWidth
                  labelId="stake-target-select-label"
                  id="stake-target-select"
                  value={stakeTarget}
                  onChange={(e) => onChange(e, setStakeTarget)}
                  input={<CustomSelect  />}>
                  <MenuItem value={"staketarget"}>Stake Target</MenuItem>
                  <MenuItem value={"minapr"}>Minimum APR</MenuItem>
                  <MenuItem value={"maxapr"}>Maximum APR</MenuItem>
                  <MenuItem value={"updateapr"}>APR Update Rate</MenuItem>
                  <MenuItem value={"voteweight"}>Voting Weight</MenuItem>
              </Select>
              </Box>
          </Box>
          <Box marginTop="44px" marginBottom="80px">
            <Box display="flex" justifyContent="space-between" marginBottom="43px">
                <Typography variant="body1" color="primary">Stake Target</Typography>
                <Box>
                  {stakeTarget === "staketarget" ? 
                   <TextField 
                    required
                    onChange={(e) => onChange(e, setStakeAmount)}  
                    placeholder="10,000,000" 
                    value={stakeAmount}
                    className={classes.input}
                    InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustom }}
                  /> : <Typography variant="body1" color="primary"><NumberFormat value={stakeAmount} displayType={'text'} thousandSeparator={true} suffix={' API3'} /></Typography>
                  }
                </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom="43px">
                <Typography variant="body1" color="primary">Minimum APR</Typography>
                <Box>
                {stakeTarget === "minapr" ? 
                <Box width="35%">
                   <TextField 
                    required
                    onChange={(e) => onChange(e, setMinAmountAPR)}  
                    placeholder={"2.5"}
                    value={minAmountAPR}
                    className={classes.input}
                    InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage }}
                  />
                  </Box>
                   :
                  <Typography variant="body1" color="primary">{minAmountAPR}%</Typography>}
                </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom="43px">
                <Typography variant="body1" color="primary">Maximum APR</Typography>
                <Box>
                {stakeTarget === "maxapr" ? 
                <Box width="35%">
                   <TextField 
                    required
                    onChange={(e) => onChange(e, setMaxAmountAPR)}  
                    placeholder={"75"}
                    value={maxAmountAPR}
                    className={classes.input}
                    InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage }}
                  />
                  </Box>
                   :
                  <Typography variant="body1" color="primary">{maxAmountAPR}%</Typography>}
                </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom="43px">
                <Typography variant="body1" color="primary">APR Update Rate</Typography>
                <Box>
                {stakeTarget === "updateapr" ? 
                   <TextField 
                    required
                    onChange={(e) => onChange(e, setUpdateRateAPR)}  
                    placeholder="1,000,000" 
                    value={updateRateAPR}
                    className={classes.input}
                    InputProps={{ disableUnderline: true, inputComponent: NumberFormatCustom }}
                  /> : <Typography variant="body1" color="primary"><NumberFormat value={updateRateAPR} displayType={'text'} thousandSeparator={true} suffix={' API3'} /></Typography>
                  }  
                </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" marginBottom="43px">
                <Box width="44%">
                  <Typography variant="body1" color="primary">Minimum voting weight to create a proposal</Typography>
                </Box>
                <Box>
                {stakeTarget === "voteweight" ? 
                <Box width="35%">
                   <TextField 
                    required
                    onChange={(e) => onChange(e, setVoteWeightAmount)}  
                    placeholder={"0.1"}
                    value={voteWeightAmount}
                    className={classes.input}
                    InputProps={{ disableUnderline: true, inputComponent: NumberFormatPercentage }}
                  />
                  </Box>
                   :
                  <Typography variant="body1" color="primary">{voteWeightAmount}%</Typography>}  
                </Box>
            </Box>
          </Box>
           <Box marginBottom="24px">
              <Box marginBottom="24px">
                  <Typography variant="body1" color="primary">Reference</Typography>
              </Box>
              <TextField 
                  required
                  onChange={(e) => onChange(e, setLinkInfo)}  
                  placeholder="Link to more information" 
                  value={linkInfo}
                  className={classes.input}
                  InputProps={{ disableUnderline: true }}
              />
          </Box>
          </Box>

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