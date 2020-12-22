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
      { address.slice(0, 5) }...{ address.slice(-5) }
    </Typography>
  );
}

export default AddressInfo;