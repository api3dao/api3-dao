import React from "react";
import {
  Typography,
} from "@material-ui/core";

import useStyles from "components/AddressInfo/styles";

function AddressInfo(props: any) {
  const classes = useStyles();
  const { address } = props
  return (
    <Typography variant="subtitle2" className={classes.root}>
      { address }
    </Typography>
  );
}

export default AddressInfo;