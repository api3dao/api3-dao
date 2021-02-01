import React from "react";
import {
  Box,
  Typography
} from "@material-ui/core";

import {
  WarningIcon,
  CloseIcon,
  DoneIcon,
  ChangeHistoryIcon,
} from "components/@material-icons";

import useStyles from "components/Proposals/ProposalItem/styles";

function ProposalItem(props: any) {
  const classes = useStyles(props);
  console.log(props)

  return (
    <Box className={classes.proposalitem} padding="16px">
        <Typography variant="body1" color="secondary">
          Vote #: { props.voteIndex }
        </Typography>
        <Box display="flex" width="30%" justifyContent="space-between">
        {
          !props.vote.executed ? 
            <Box display="flex" alignItems="center"> 
              <WarningIcon className={classes.active} color="secondary" fontSize="small" />
              <Typography variant="subtitle2" color="secondary">Active</Typography>
            </Box>
        : 
          props.vote.executed && parseInt(props.vote.yea) > parseInt(props.vote.nay) ? 
            <Box display="flex" alignItems="center"> 
              <DoneIcon className={classes.done} fontSize="small" />
              <Typography variant="subtitle2" className={classes.done}>Passed</Typography>
            </Box >
          :
            <Box display="flex" alignItems="center"> 
              <CloseIcon className={classes.reject} fontSize="small" />
              <Typography variant="subtitle2" color="secondary" className={classes.reject}>Rejected</Typography>
            </Box>
        }
        <Box display="flex">
          <Typography variant="subtitle2" className={classes.active} color="textSecondary">00</Typography>
          <ChangeHistoryIcon style={{ color: "#4A4A4A" }}  fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle2" className={classes.active} color="textSecondary">
            { 
              new Date(parseInt(props.vote.startDate)).toLocaleString()
            }
          </Typography>
        </Box>
        </Box>
    </Box>
  );
}

export default ProposalItem;