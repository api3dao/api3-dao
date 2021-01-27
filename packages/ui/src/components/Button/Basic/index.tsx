import React from "react";
import {
  Box,
  // Button,
} from "@material-ui/core";

import useStyles from "components/Button/Basic/styles";

function BasicButton(props: any) {
  const { whiteTheme, onClick, title } = props;
  const classes = useStyles();
  const buttonColor = whiteTheme ? classes.whiteButton : classes.button;
  const firstSpan = whiteTheme ? classes.whiteFirstSpan : classes.firstSpan;
  return (
    <Box>
      <button onClick={onClick} className={buttonColor}>
        { title }
      </button>
      <span className={firstSpan} />
      <span className={classes.secondSpan} />
    </Box>
  );
}

export default BasicButton;