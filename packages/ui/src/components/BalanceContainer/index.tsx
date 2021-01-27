import React from 'react';
import { BasicButton } from "components"

import { Typography } from '@material-ui/core';

// import useStyles from "components/BalanceContainer/styles";
import useCommonStyles from "styles/common-styles";

function BalanceContainer() { 
    const commonClasses = useCommonStyles();

    return (<div className={commonClasses.marginContainer} style={{ width: "50%", marginRight: "48px" }}>
        <div className={commonClasses.titleWithButton}>
            <Typography variant="body1" color="secondary">Balance</Typography>
            <BasicButton title="+ Deposit" />
        </div>
        <div className={commonClasses.borderContainer} style={{ padding: "5%" }}> 
            <div className={commonClasses.centeredBox}>
                <Typography variant="body1" color="textSecondary" style={{ padding: "2%" }}>Total</Typography>
                <Typography variant="h2" color="secondary" style={{ padding: "2%" }}>0</Typography>
                <Typography variant="body1" color="textSecondary" style={{ padding: "2%" }}>Withdrawable</Typography>
                <Typography variant="h2" color="secondary" style={{ padding: "2%" }}>0</Typography>
            </div>
            <div className={commonClasses.leftBox}>
                <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}}>Withdraw</Typography>
        </div>
      </div>
        </div>)

}

export default BalanceContainer;