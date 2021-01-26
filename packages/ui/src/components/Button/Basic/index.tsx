import React from "react";
import {
  Box,
  // Button,
} from "@material-ui/core";

import useStyles from "components/Button/Basic/styles";

function BasicButton(props: any) {
  const classes = useStyles();
  return (
    <Box>
      <button onClick={props.onClick} className={classes.button}>{props.title}</button>
      <span className={classes.firstSpan} />
      <span className={classes.secondSpan} />
    </Box>
  );
}

export default BasicButton;