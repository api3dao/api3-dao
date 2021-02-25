import React, { useState, useEffect }  from "react";
import { Typography, Box } from "@material-ui/core";
import { counter } from "utils/time";

import useStyles from "components/Counter/styles";

function Counter(props: any) {
  const classes = useStyles();
  const { countDownDate: date } = props
  const start = "00:00:00:00"
  let [time, setTimer] = useState<string | number>(start)

  const componentDidMount = () => {
    const count = async () => {
      // for now lets hard code date
      if(date) {
        // Get today's date and time
        const now = new Date().getTime();
        const countDownDate = new Date(date).getTime();

        // Find the distance between now and the count down date      
        const distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const timeCalculations = counter(distance);

        setTimer(timeCalculations);

        const stop = (distance < 0 && isNaN(distance));
        if (stop) {
          clearInterval(interval);
          console.log("done counting")
        }
      }
    }
    const interval = setInterval(() => {
      count();
    }, 1000);
  }

  useEffect(componentDidMount, [date]);

  return (
    <>
      <Typography variant="h2" color="secondary">
      { time }
      </Typography>
      <Box className={classes.timeText} paddingLeft="5%" display="flex">
      <Typography variant="subtitle2" color="textSecondary">D</Typography>
      <Typography variant="subtitle2" color="textSecondary">HR</Typography>
      <Typography variant="subtitle2" color="textSecondary">MIN</Typography>
      <Typography variant="subtitle2" color="textSecondary">SEC</Typography>
      </Box>
    </>
  );
}

export default Counter;