import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography
} from "@material-ui/core";
import {
    Chart,
    BarSeries
  } from '@devexpress/dx-react-chart-material-ui';
import { Animation, Palette } from '@devexpress/dx-react-chart';

import { AragonContext } from "contexts";

import {
  WarningIcon,
  CloseIcon,
  DoneIcon,
  KeyboardArrowRightIcon,
} from "components/@material-icons";
import { proposalStatusTime } from "utils/time";

import useStyles from "components/Proposals/ProposalItem/styles";

function ProposalItem(props: any) {
  const classes = useStyles(props);
  const aragonContext = useContext(AragonContext);
  // console.log(props);
  // let total = parseInt(props.vote.yea + props.vote.no);
  // let percentageYes = parseInt(props.vote.yea) / total * 100;
  // let percentageNo = parseInt(props.vote.no) / total * 100;
  const data = [
    { label: 'yes', yes: 0 }, // for some reason they are inverted
    { label: 'no', no: 100 }, 
  ];

  const setVote = () => {
    // console.log("setVote props", props)
    console.log('aragonContext in ProposalItem', aragonContext);
    const vote = {
      ...props.vote,
      voteIndex: props.voteIndex
    }
    aragonContext.setVote(vote);
  }
  const { vote } = props;
  console.log(vote.metadata);
  return (
    <Link to={{ pathname: `/proposals/${props.voteIndex}`, state: props }} style={{ textDecoration: "none"}} onClick={setVote}>
    <Box className={classes.proposalitem} padding="16px" display="flex" justifyContent="space-between">
        <Box width="50%">
          <Typography variant="body1" color="secondary">
            Vote #: { props.voteIndex }  { vote.metadata }
          </Typography>
          <Box display="flex" justifyContent="space-between">
            {
              !props.vote.executed ? (
                <Box display="flex" alignItems="center"> 
                  {
                    proposalStatusTime(vote.executed, vote.startDate) ? (
                      <>
                        <CloseIcon className={classes.reject} fontSize="small" />
                        <Typography variant="subtitle2" color="secondary" className={classes.reject}>Rejected</Typography>
                      </>
                    ) : (
                      <>
                        <WarningIcon className={classes.active} color="secondary" fontSize="small" />
                        <Typography variant="subtitle2" color="secondary">Active</Typography>
                      </>
                    )
                  }
                </Box>
              )
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

            <Box>
              <Typography variant="subtitle2" className={classes.active} color="textSecondary">
                { 
                  new Date(parseInt(props.vote.startDate)*1000).toLocaleString()
                }
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex">
          <Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <DoneIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle2" color="secondary">{100}%</Typography>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <CloseIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle2" color="secondary">{0}%</Typography>
            </Box>
          </Box>
          <Box display="block" marginTop="-8px">
            <Chart
              data={data}
              rotated
              height={50}
              width={100}
            >
              {
                !props.vote.executed ? (
                  <Palette scheme={['#FFFFFF', '#FFFFFF', '#00C853', '#FFEB3B', '#FF4081', '#E040FB']} />
                ) : props.vote.executed && parseInt(props.vote.yea) > parseInt(props.vote.nay) ? (
                  <Palette scheme={['#878888', '#7CE3CB', '#00C853', '#FFEB3B', '#FF4081', '#E040FB']} />
                ) : (
                  <Palette scheme={['#823FB1', '#878888', '#00C853', '#FFEB3B', '#FF4081', '#E040FB']} />
                )
              }
              <BarSeries
                valueField="yes"
                argumentField="label"
              />
               <BarSeries
                valueField="no"
                argumentField="label"
              />
              <Animation />
            </Chart>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <KeyboardArrowRightIcon color="secondary" fontSize="large" />
        </Box>
    </Box>
    </Link>
  );
}

export default ProposalItem;