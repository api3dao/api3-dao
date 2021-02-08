import React from "react";
import {
  Typography,
  Box,
} from "@material-ui/core";

import { ArrowDropDownIcon } from "components/@material-icons";
import useStyles from "components/AddressInfo/styles";

function AddressInfo(props: any) {
  const classes = useStyles();
  const { address } = props
  return (
    <Box className={classes.root}>
      <Box>
        <Typography variant="subtitle2">
          { address.slice(0, 5) }...{ address.slice(-5) }
        </Typography>
        <Typography variant="subtitle2">
          Connected to __
        </Typography>
      </Box>
      <ArrowDropDownIcon />        
    </Box>
  );
}

export default AddressInfo;