import React from 'react';
import { Container, Box, Typography } from '@material-ui/core';
import { SetStakingTargetButton } from "components"
import useStyles from "containers/dashboard/styles";

function Dashboard() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Box> 
        <Box className={classes.box}>
          <Typography variant="h4" >
            What would like to do?
          </Typography>
        </Box>
        <Box className={classes.box}>
          <SetStakingTargetButton />
        </Box>
      </Box>
      
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          list of total tokens staked: { 0 }
        </Typography>
      </Box>
      
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          user token balance: { 0 }
        </Typography>
      </Box>
      
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          user staked token balance: { 0 }
        </Typography>
      </Box>
    </Container>
  );
}

export default Dashboard;
