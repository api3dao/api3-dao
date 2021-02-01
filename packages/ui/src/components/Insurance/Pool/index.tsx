import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import { Animation, Palette } from '@devexpress/dx-react-chart';

import useStyles from "components/Insurance/Pool/styles";
import useCommonStyles from "styles/common-styles";

function InsurancePool(props: any) {
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  let dataProgress = 81;

  let ChartData = [
    { region: 'Progress', val: dataProgress },
    { region: 'notprogress', val: 100 - dataProgress  }
  ];

  return (
  <Box marginTop="6%">
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" color="secondary">
        Insurance Pool
      </Typography>
      { 
        props.walletConnected && 
        <Typography variant="body1" color="secondary" style={{ textDecoration: "underline "}}>
          How This Works
        </Typography>
      }
    </Box>
    <Box className={commonClasses.borderContainer}> 
      <Box display="flex" flexDirection="row" justifyContent="space-around" alignItems="center" padding="1%">
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" padding="1%">
            <Typography variant="h3" color="textSecondary" className={classes.subTitle}>Annual Rewards (APY)</Typography>
            <Typography variant="h1" color="secondary">10%</Typography>
            <Typography variant="h3" color="textSecondary" className={classes.subTitle}>Annual Inflation Rate</Typography>
            <Typography variant="h1" color="secondary">2%</Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" padding="1%">
          <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>
            TOTAL STAKED
          </Typography>
          <Box paddingBottom="35%">
            <Typography variant="h2" color="secondary">
              8,540,000
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>
            STAKING TARGET
          </Typography>
          <Typography variant="h2" color="secondary">
            10,000,000
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" padding="1%">
          <Box className={classes.innerChartText}>
            <Typography variant="h1" color="secondary">85.4%</Typography>
            <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>OF TARGET MET</Typography>
          </Box>
          <Chart
            data={ChartData}
            width={172}
            height={172}
          >
            <Palette scheme={['#7CE3CB', '#5B5858', '#00C853', '#FFEB3B', '#FF4081', '#E040FB']} />
            <PieSeries
              valueField="val"
              argumentField="region"
              innerRadius={0.9}
            />
            <Animation />
          </Chart>
        </Box>
      </Box>
    </Box>
  </Box>
  )
}

export default InsurancePool;