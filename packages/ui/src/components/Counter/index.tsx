import React, { useState, useEffect }  from "react";

import { counter } from "utils/time";

// import useStyles from "components/Navbar/styles";

function Counter(props: any) {
  // const classes = useStyles();
  const { countDownDate: date } = props
  const start = "00:00:00"
  let [time, setTimer] = useState<string | number>(start)

  const componentDidMount = () => {
    const count = async () => {
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
      { time }
    </>
  );
}

export default Counter;