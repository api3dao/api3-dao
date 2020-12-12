import React from 'react';
import { Box, Typography } from '@material-ui/core';
import {
  SetStakingTargetButton,
} from "components"

import useStyles from "components/Actions/styles";

function Actions() {
  const classes = useStyles();
  return (
    <>
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
    </>
  );
}

export default Actions;
