import React from 'react';
import { Container, Box, Typography } from '@material-ui/core';
import { SetStakingTargetButton } from "components"

function Dashboard() {
  return (
    <Container>
      <Box>
        <Typography variant="h4">
          What would like to do?
        </Typography>
        <Box>
          <SetStakingTargetButton />
        </Box>
      </Box>
      
      <Box>
        <Typography variant="subtitle1">
          list of total tokens staked: { 0 }
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle1">
          user token balance: { 0 }
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle1">
          user staked token balance: { 0 }
        </Typography>
      </Box>
    </Container>
  );
}

export default Dashboard;
