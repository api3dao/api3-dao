import React from 'react';
import { useLocation } from "react-router-dom";
import { Container,  Typography, Box } from "@material-ui/core";

import { BasicButton, Counter } from "components";
import { WarningIcon, DoneIcon, HelpOutlineIcon, CloseIcon, ChangeHistoryIcon } from "components/@material-icons";

import useCommonStyles from "styles/common-styles";
import useStyles from "containers/proposal/details/styles";

interface StateProps {
  state: {
    vote: {
      executed: boolean;
      yea: string;
      nay: string;
      startDate: string;
    }
    voteIndex: string; 
  }
}

function ProposalDetails() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const { state } : StateProps = useLocation();
  const { vote, voteIndex } = state;

  return (
    <Container className={classes.root}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Proposals</Typography>
        <Box marginLeft="32px">
          <Typography variant="subtitle2" color="textSecondary">Proposals</Typography>
          <Typography variant="h2" color="secondary">Proposals {voteIndex}</Typography>
        </Box>
        <Box display="flex" justifyContent="center" flexDirection="column" margin="16px" width="12%">
            <Counter countDownDate={new Date().setDate(new Date().getDate() + 6)} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Box marginLeft="32px" display="flex" width="100%" className={classes.proposalSubtitle}>
          {!vote.executed ? 
              <Box display="flex" alignItems="center"> 
                  <WarningIcon className={classes.activeIcon} color="secondary" fontSize="small" />
                  <Typography variant="body1" color="secondary">Active</Typography>
              </Box>
          : vote.executed && parseInt(vote.yea) > parseInt(vote.nay) ? 
              <Box display="flex" alignItems="center"> 
                  <DoneIcon className={classes.doneIcon} fontSize="small" />
                  <Typography variant="body1" className={classes.doneIcon}>Passed</Typography>
              </Box >
          :
              <Box display="flex" alignItems="center"> 
                  <CloseIcon className={classes.rejectIcon} fontSize="small" />
                  <Typography variant="body1" color="secondary" className={classes.rejectIcon}>Rejected</Typography>
              </Box>
          }
          <Box display="flex">
              <Typography variant="subtitle2" className={classes.activeIcon} color="textSecondary">00</Typography>
              <ChangeHistoryIcon style={{ color: "#4A4A4A" }}  fontSize="small" />
          </Box>    
          <Box>
              <Typography variant="subtitle2" className={classes.activeIcon} color="textSecondary">{new Date(parseInt(vote.startDate)).toLocaleString()}</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" className={classes.activeIcon} color="textSecondary">Remaining</Typography>
        </Box>
      </Box>
      <Box marginTop="6%" display="flex" justifyContent="space-between">
        <Box>
          <BasicButton title="Vote" color="black" />
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="flex-end">
          <Box display="flex">
          <Typography variant="body1"  color="secondary">0.1%  My Voting Weight</Typography>
          <HelpOutlineIcon color="secondary" fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body1"  color="secondary" style={{ textDecoration: "underline" }}>Delegate My Votes</Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default ProposalDetails;