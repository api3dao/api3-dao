import React, { useState } from "react";
import { Typography, Modal, Paper, TextField } from "@material-ui/core";

import { BasicButton } from "components"
import useStyles from "components/Staking/StakingContainer/styles";
import useCommonStyles from "styles/common-styles";

function StakingContainer() { 
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [modal, setUnstakeModal] = useState(false);

  const UnstakeModal = () => {
    const [unstakeAmount, setUnstakeAmount] = useState(0);
    const [nextTabModal, setTabModal] = useState(false);
    
    const changeTabModal = (tab: boolean, amount: number) => { 
      setUnstakeModal(tab); 
      setUnstakeAmount(amount); 
      setTabModal(false);
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

    return (
      <Modal
        open={modal}
        onClose={onClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={commonClasses.centeredBox} style={{ height: "100%" }}>
          { 
            !nextTabModal ? (
              <Paper className={classes.modal}>
                <TextField 
                  required 
                  type="number" 
                  className={classes.input} 
                  inputProps={inputProps} 
                  onChange={onChange}  
                  placeholder="0" 
                  value={unstakeAmount} 
                />
                <BasicButton onClick={onClick} whiteTheme title="Initiate Unstaking" />
              </Paper>
            ) : (
              <Paper>
                <Typography variant="body1" color="primary" style={{ padding: "2%" }}>
                  Are you sure you would like to unstake { unstakeAmount } tokens?
                </Typography>
                <div className={commonClasses.centeredBox} style={{ flexDirection: "row" }}>
                  <Typography 
                    onClick={onCancel} 
                    variant="body1" color="primary" 
                    className={classes.cancelButton}
                  >
                    Cancel
                  </Typography>
                  <BasicButton whiteTheme title="Yes, Initiate Unstake" />
                </div>
              </Paper>
            )          
          }
        </div>
      </Modal>
    )
  }

  return (
    <div className={commonClasses.marginContainer} style={{ width: "50%" }}>
      <div className={commonClasses.titleWithButton}>
        <Typography variant="body1" color="secondary">Staking</Typography>
        <BasicButton title="+ Stake" />
      </div>
      <div className={commonClasses.borderContainer} style={{ padding: "5%" }}> 
        <div className={commonClasses.centeredBox}>
          <Typography variant="body1" color="textSecondary" style={{ padding: "2%" }}>Staked</Typography>
          <Typography variant="h2" color="secondary" style={{ padding: "2%" }}>0</Typography>
          <Typography variant="body1" color="textSecondary" style={{ padding: "2%" }}>Unstaked</Typography>
          <Typography variant="h2" color="secondary" style={{ padding: "2%" }}>0</Typography>
        </div>
        <div className={commonClasses.leftBox}>
          <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}} onClick={() => setUnstakeModal(true)}>Initiate Unstake</Typography>
          <UnstakeModal />
        </div>
      </div>
    </div>
  );
}

export default StakingContainer;