import React from "react";
import {
  Typography,
} from "@material-ui/core";

import useStyles from "components/AddressInfo/styles";

function AddressInfo(props: any) {
  const classes = useStyles();
  const { address } = props
  return (
    <div className={classes.root}>
          <Typography variant="subtitle2">
            { address.slice(0, 5) }...{ address.slice(-5) }
          </Typography>
          <Typography variant="subtitle2">
            Connected to __
          </Typography>
        </div>
  );
}

export default AddressInfo;