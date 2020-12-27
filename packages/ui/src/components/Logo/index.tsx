import React from "react";

import { logo } from "assets/logo";

import useStyles from "components/Logo/styles";

function Logo(props: any) {
  const classes = useStyles()
  return (
    <img src={logo} alt="" className={classes.logo}/>
  );
}

export default Logo;