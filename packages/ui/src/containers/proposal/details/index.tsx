import React, { useState } from 'react';
import { useLocation, Link } from "react-router-dom";
import { Container,  Typography, Box } from "@material-ui/core";
import {
  Chart,
  BarSeries,
} from '@devexpress/dx-react-chart-material-ui';
import { Animation, Palette } from '@devexpress/dx-react-chart';

import { BasicButton, Counter, DelegateModal, VoteModal } from "components";
import { WarningIcon, DoneIcon, HelpOutlineIcon, CloseIcon, ChangeHistoryIcon, ArrowBackIcon, OpenInNewIcon } from "components/@material-icons";

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

// this is hard coded for now.
const data = [
  { label: 'yes', yes: 0 }, // for some reason they are inverted
  { label: 'no', no: 100 }, 
];

// this should be part of a styling global file
const palleteScheme = ['#FFFFFF', '#FFFFFF', '#00C853', '#FFEB3B', '#FF4081', '#E040FB'];

function ProposalDetails() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const { state } : StateProps = useLocation();
  const { vote, voteIndex } = state;
  const [voted, setVoted] = useState("")
  const [voteModal, setVoteModal] = useState(false);
  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegateModal, setDelegateModal] = useState(false);
  // DelegateModal
  // const { setDelegateModal, setDelegateAddress, delegateModal } = props;
  // VoteModal
  // const { voteIndex, voteModal, setVoteModal, setVoted } = props;
  // this is hardcoded for now
  const countDownDate = new Date().setDate(new Date().getDate() + 6)
  
  return (
    <Container className={classes.root}>
      <Link to="/proposals">
        <Box display="flex" alignItems="center" marginLeft="6%">
          <ArrowBackIcon color="secondary" fontSize="large" />
          <Typography variant="body1" color="secondary" style={{ textDecoration: 'none' }}>Back</Typography>
        </Box>
      </Link>
      
      <Box display="flex" justifyContent="space-between" marginTop="3%">
        <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Proposals</Typography>
        <Box marginLeft="32px">
          <Typography variant="subtitle2" color="textSecondary">Proposals</Typography>
          <Typography variant="h2" color="secondary">Proposals {voteIndex}</Typography>
        </Box>
        <Box display="flex" justifyContent="center" flexDirection="column" margin="16px" width="12%">
            <Counter countDownDate={countDownDate} />
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Box marginLeft="32px" display="flex" width="100%" alignItems="center" className={classes.proposalSubtitle}>
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
          <BasicButton title={voted === "" ? "Vote" : "Change Vote"} color="black" onClick={() => setVoteModal(true)}/>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="flex-end">
          <Box display="flex">
            <Typography variant="body1"  color="secondary">0.1%  My Voting Weight</Typography>
            <HelpOutlineIcon color="secondary" fontSize="small" />
          </Box>
          {
            delegateAddress !== "" ? (
              <Box display="flex">
                <Typography variant="body1"  color="secondary" style={{ paddingRight: "5px"}}>{delegateAddress}</Typography>
                <OpenInNewIcon color="secondary" fontSize="small" />
                <Box paddingLeft="5px">
                  <Typography variant="body1"  color="secondary" style={{ textDecoration: "underline", cursor: "pointer" }}>
                    Cancel Delegation
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box onClick={() => setDelegateModal(true)}>
                <Typography variant="body1"  color="secondary" style={{ textDecoration: "underline", cursor: "pointer" }}>
                  Delegate My Votes
                </Typography>
              </Box>
            )
          }
        </Box>
      </Box>
      
      <Box marginTop="3%" display="flex" justifyContent="space-between">  
        <Box 
          className={commonClasses.borderContainer} 
          padding="2%" 
          width="50%" 
          style={voted === "for" ? { border: "3px solid #FFFFFF", marginRight: "20px" } : { marginRight: "20px" }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h2"  color="secondary">For</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" width="30%">
              <Typography variant="body1" color="secondary">60,000 tokens</Typography>
              <Typography variant="body1" color="secondary">80%</Typography>
            </Box>
          </Box>
          <Box margin="1%" marginTop="3%" display="flex" justifyContent="space-between" alignItems="center">
            <DoneIcon className={classes.doneIcon} fontSize="large" />
            <Box display="block" marginTop="-8px" className={commonClasses.borderContainer} width="90%">
              <Chart
                data={data}
                rotated
                height={30}
              >
                <Palette scheme={palleteScheme} />
                <BarSeries
                  valueField="yes"
                  argumentField="label"
                />
                <Animation />
              </Chart>
            </Box>
          </Box>
        </Box>
        
        <Box 
          className={commonClasses.borderContainer} 
          padding="2%" 
          width="50%"
          style={voted === "against" ? { border: "3px solid #FFFFFF" }: {}}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h2"  color="secondary">Against</Typography>
            </Box>
            <Box  display="flex" justifyContent="space-between" width="30%">
              <Typography variant="body1" color="secondary">15,000 tokens</Typography>
              <Typography variant="body1" color="secondary">10%</Typography>
            </Box>
        </Box>

        <Box margin="1%" marginTop="3%" display="flex" justifyContent="space-between" alignItems="center">
          <CloseIcon className={classes.rejectIcon} fontSize="large" />
          <Box display="block" marginTop="-8px" className={commonClasses.borderContainer} width="90%">
            <Chart
              data={data}
              rotated
              height={30}
              width={500}
            >
              <Palette scheme={palleteScheme} />
              <BarSeries
                valueField="no"
                argumentField="label"
                />
              <Animation />
            </Chart>
          </Box>
        </Box>
        
        </Box>
      </Box>

      <Box marginTop="3%">
        <Box marginBottom="2%">
          <Typography variant="body1" color="secondary">Summary</Typography>
        </Box>
        <Box className={commonClasses.borderContainer} padding="4%">
          <Typography variant="body1" color="secondary" style={{ lineHeight: "32px" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            Link to discussion: _______                
          </Typography>
          <VoteModal voteIndex={voteIndex} voteModal={voteModal} setVoteModal={setVoteModal} setVoted={setVoted} />
          <DelegateModal setDelegateModal={setDelegateModal} setDelegateAddress={setDelegateAddress} delegateModal={delegateModal} />
        </Box>
      </Box>
    </Container>
  );
}

export default ProposalDetails;