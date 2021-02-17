import React, { } from "react";
import { Container, Typography } from "@material-ui/core";

import useStyles from "containers/landing/styles";
import useCommonStyles from "styles/common-styles";
import { BalanceContainer, StakingContainer, API3Buttons, VoteProposalButtons } from "components";

function Testing() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  return (
    <Container className={classes.root}>
      <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Dashboard</Typography>
      <div className={commonClasses.mainTitleContainer}>
        <Typography variant="subtitle2" color="textSecondary" style={{ color: "#878888" }}>Dashboard</Typography>
        <Typography variant="h2" color="secondary">Welcome to the API3 DAO</Typography>
      </div>
      <div className={commonClasses.marginContainer}>
        <API3Buttons />
        <VoteProposalButtons voteIndex={49} proposalType="vote"/>
      </div>  
      <div style={{ display: "flex" }}>
        <BalanceContainer />
        <StakingContainer />
      </div>
    </Container>
  );
}

export default Testing;