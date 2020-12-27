import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
import { API3Context } from "contexts";

import useStyles from "components/API3Stats/styles";

function Global() {
  const api3Context = useContext(API3Context)
  const classes = useStyles();
  // Global dashboard (Staking APY, total API3 tokens, tokens staked, % staked, staking target, epoch number, time to next epoch)
  return (
    <Box className={classes.root}>
      <Box className={classes.box}>
        {
          api3Context.tokens[0] && (
            <Typography variant="h4">
              Global API3 Stats
            </Typography>
          )
        }
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          API3 Tokens Supply: { api3Context.tokens[0] ? api3Context.tokens[0].totalSupply : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          API3Staked Tokens Supply: { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Staking APY { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Percentage Staked { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Staking Target { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>

      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Epoch Number { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>
      <Box className={classes.box}>
        <Typography variant="subtitle1">
          Next Epoch Time  { api3Context.tokens[1] ? api3Context.tokens[1].totalSupply : 0 }
        </Typography>
      </Box>
    </Box>
  )
}

export default Global;
