import React from "react";
import {
  Button,
  Typography,
} from "@material-ui/core";

// import useStyles from "components/AddressInfo/styles";

function AddressInfo(props: any) {
  // const classes = useStyles();
  const { address } = props
  return (
    <Typography variant="subtitle1" >
      { address }
    </Typography>
  );
}

export default AddressInfo;