import React from 'react';
import { Typography } from '@material-ui/core';
import { BasicButton } from "components"

import useStyles from "components/StakingContainer/styles";
import useCommonStyles from "styles/common-styles";

function StakingContainer() { 
    const commonClasses = useCommonStyles();

    return (<div className={commonClasses.marginContainer} style={{ width: "50%" }}>
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
                <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}}>Initiate Unstake</Typography>
            </div>
      </div>
    </div>);

}

export default StakingContainer;