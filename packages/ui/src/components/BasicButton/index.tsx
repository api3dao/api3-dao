import React from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import useStyles from "components/BasicButton/styles";

function BasicButton(props: any) {
  const classes = useStyles();
  return (
    <Box>
      <Button onClick={props.onClick} color="secondary" className={classes.button}>{props.title}</Button>
    </Box>
  );
}

export default BasicButton;