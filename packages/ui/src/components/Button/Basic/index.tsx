
import React from "react";
import {
  Box,
} from "@material-ui/core";

import useStyles from "components/Button/Basic/styles";

function BasicButton(props: any) {
  const { onClick, title, color } = props;
  const classes = useStyles(props);
  /* const buttonColor = whiteTheme ? classes.whiteButton : classes.button;
  const firstSpan = whiteTheme ? classes.whiteFirstSpan : classes.firstSpan; */
  return (
    <Box>
      <button color={props.disabled ? 'disabled': color} onClick={onClick} className={classes.button} disabled={props.disabled}>
        { title }
      </button>
      <span color={color} className={classes.firstSpan} />
      <span className={classes.secondSpan} />
    </Box>
  );
}

export default BasicButton;