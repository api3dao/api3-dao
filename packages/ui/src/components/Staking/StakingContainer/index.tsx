import React, { useState } from "react";
import { Typography, Modal, Paper, TextField } from "@material-ui/core";

import { BasicButton } from "components"
import useStyles from "components/Staking/StakingContainer/styles";
import useCommonStyles from "styles/common-styles";

function StakingContainer() { 
  const commonClasses = useCommonStyles();
  const [modal, setUnstakeModal] = useState(false);

  const UnstakeModal = () => {
    const [unstakeAmount, setUnstakeAmount] = useState(0);

    return (
      <Modal
        open={modal}
        onClose={() => setUnstakeModal(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={commonClasses.centeredBox} style={{ height: "100%" }}>
          <Paper style={{ height: "250px", width: "400px", padding: "0 2%" }}>
            <Typography variant="body1" color="primary" style={{ padding: "2%" }}>
              How many tokens would you like to unstake?
            </Typography>
            <TextField defaultValue={unstakeAmount} value={unstakeAmount} />
            <BasicButton title="Initiate Unstaking" />
          </Paper>
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