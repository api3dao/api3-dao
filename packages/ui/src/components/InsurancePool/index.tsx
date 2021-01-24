import React from 'react';
import { Typography } from '@material-ui/core';
import { Chart, PieSeries } from '@devexpress/dx-react-chart-material-ui';
import { Animation, Palette } from '@devexpress/dx-react-chart';

import useStyles from "components/InsurancePool/styles";
import useCommonStyles from "styles/common-styles";

function InsurancePool() {
    const classes = useStyles();
    const commonClasses = useCommonStyles();

    let dataProgress = 81;

    let ChartData = [
      { region: 'Progress', val: dataProgress },
      { region: 'notprogress', val: 100 - dataProgress  }
    ];

    return (
    <div className={commonClasses.marginContainer}>
        <Typography variant="body1" color="secondary">Insurance Pool</Typography>
        <div className={commonClasses.borderContainer}> 
        <div className={classes.insurancePoolContainer}>
        <div className={commonClasses.centeredBox} style={{ padding: "1%" }}>
        <Typography variant="h3" color="textSecondary" className={classes.subTitle}>Annual Rewards (APY)</Typography>
        <Typography variant="h1" color="secondary">10%</Typography>

        <Typography variant="h3" color="textSecondary" className={classes.subTitle}>Annual Inflation Rate</Typography>
        <Typography variant="h1" color="secondary">2%</Typography>
        </div>
        <div className={commonClasses.centeredBox} style={{ padding: "1%" }}>
        <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>TOTAL STAKED</Typography>
        <Typography variant="h2" color="secondary" style={{ paddingBottom: "35%" }}>8,540,000</Typography>

        <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>STAKING TARGET</Typography>
        <Typography variant="h2" color="secondary">10,000,000</Typography>
        </div>
        <div className={commonClasses.centeredBox} style={{ padding: "1%" }}>
        <div className={classes.innerChartText}>
        <Typography variant="h1" color="secondary">85.4%</Typography>
        <Typography variant="subtitle2" color="textSecondary" className={classes.subTitle}>OF TARGET MET</Typography>
        </div>
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
        </div>
        </div>
        </div>
      </div>)

}

export default InsurancePool;