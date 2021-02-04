import React, { useState } from "react";
import { 
  Typography, 
  Modal, 
  Paper, 
  TextField,
  Box,

} from "@material-ui/core";

import { 
  BasicButton,
  Counter,
} from "components"

import { CloseIcon } from "components/@material-icons";

import useStyles from "components/Staking/StakingContainer/styles";
import useCommonStyles from "styles/common-styles";

interface IStakingContainer {
  unstakeAvailable?: boolean;
  unstakeStatus?: boolean;
  unstakeTime?: number;
  unstakeTimeAvailable?: number;
  actualUnstakeAmount?: number;
  setUnstakeTime?: any;
  setUnstakeAvailable?: any;
  setUnstakeStatus?: any;
  setActualUnstakeAmount?: any;
  setUnstakeTimeAvailable?: any;
}

function StakingContainer(props?: IStakingContainer | undefined | any ) { 
  const { 
    unstakeAvailable, 
    unstakeStatus, 
    unstakeTime, 
    // unstakeTimeAvailable, 
    actualUnstakeAmount,
    setUnstakeTime,
    // setUnstakeAvailable,
    setUnstakeStatus,
    setActualUnstakeAmount,
    unstakeAmount, 
    setUnstakeAmount,
  } = props;
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [modal, setUnstakeModal] = useState(false);

  const UnstakeModal = () => {
    const [nextTabModal, setTabModal] = useState(false);
    
    const changeTabModal = (tab: boolean, amount: number) => { 
      if(setUnstakeAmount) {
        setUnstakeModal(tab); 
        setUnstakeAmount(amount); 
        setTabModal(false);
      } else {
        console.log("Not Connected")
      }
    }
    
    const onClose = () => changeTabModal(false, 0);
    
    const onClick = unstakeAmount !== 0 ? () => setTabModal(true) : "";
    
    const onChange = (event: any) => {
      setUnstakeAmount(parseInt(event.target.value));
    }
    
    const inputProps: any = { 
      style: { 
        textAlign: 'center',
      }
    }
    
    const onCancel = () => {
      changeTabModal(false, 0);
    }
    
    const onSubmit = () => {
      onCancel(); 
      setActualUnstakeAmount(unstakeAmount); 
      setUnstakeStatus(true);
      setUnstakeTime(new Date().setDate(new Date().getDate() + 6));
    }
    
    return (
      <Modal
        open={modal}
        onClose={onClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height="100%">
        <Box onClick={onClose} marginLeft="23%">
          <CloseIcon color="secondary" fontSize="large" />
        </Box>
        <Box>
          { 
            !nextTabModal ? (
              <Paper className={classes.modal}>
                <Typography variant="body1" color="primary">
                How many tokens would you like to unstake?
                </Typography>
                <TextField 
                  required 
                  type="number" 
                  className={classes.input} 
                  inputProps={inputProps} 
                  onChange={onChange}  
                  placeholder="0" 
                  value={unstakeAmount} 
                />
                <BasicButton onClick={onClick} color="white" title="Initiate Unstaking" />
              </Paper>
            ) : (
              <Paper>
                <Box padding="2%">
                  <Typography variant="body1" color="primary">
                    Are you sure you would like to unstake { unstakeAmount } tokens?
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="row">
                  <Typography 
                    onClick={onCancel} 
                    variant="body1" color="primary" 
                    className={classes.cancelButton}
                  >
                    Cancel
                  </Typography>
                  <BasicButton color="white" title="Yes, Initiate Unstake" onClick={onSubmit} />
                </Box>
              </Paper>
            )          
          }
        </Box>
      </Box>
      </Modal>
    )
  }

  return (
    <Box width="50%" marginTop="6%">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" color="secondary">Staking</Typography>
        <BasicButton color="black" title="+ Stake" />
      </Box>
      <Box className={commonClasses.borderContainer} padding="5%" style={{ marginBottom: "0px" }} > 
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" className={classes.box}>
          <Typography variant="body1" color="textSecondary">Staked</Typography>
          <Typography variant="h2" color="secondary">0</Typography>
          <Typography variant="body1" color="textSecondary">Unstaked</Typography>
          <Typography variant="h2" color="secondary">0</Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}} onClick={() => setUnstakeModal(true)}>Initiate Unstake</Typography>
          <UnstakeModal />
        </Box>
      </Box>
      {
        unstakeStatus && 
        <Box padding="-5%" className={classes.unstakeContainer}>
          <Box padding="5%">
            <Typography variant="subtitle2" color="textSecondary">Pending API3 tokens unstaking</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" padding="0 5%" paddingBottom="2%">
            <Box display="flex" justifyContent="center" flexDirection="column" margin="0 16px">
              <Typography variant="subtitle2" color="secondary">
                Amount
              </Typography>
              <Typography variant="h2" color="secondary">
                { actualUnstakeAmount }
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" flexDirection="column" margin="16px">
              <Typography variant="subtitle2" color="secondary">
                Cooldown
              </Typography>
              <Counter countDownDate={unstakeTime} />
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-around"  alignItems="center" paddingBottom="10%">
            <Typography variant="subtitle2" color="secondary" style={{ textDecoration: "underline" }}>
              Unstake & Withdraw
            </Typography>
            <BasicButton color="black" title="Unstake" disabled={unstakeTime - new Date().getTime() >= 0}/>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" paddingBottom="5%">
            {
              unstakeAvailable && 
              <Typography variant="subtitle2" color="secondary">
                You have 6 days 5 hours 30 min 2 sec remaining to unstake.
              </Typography>
            }
          </Box>
        </Box>
      }
    </Box>
  );
}

export default StakingContainer;