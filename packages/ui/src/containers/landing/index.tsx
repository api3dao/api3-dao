import React, { } from "react";
import { Container, Typography, Box } from "@material-ui/core";
import Carousel from "react-material-ui-carousel";

import useStyles from "containers/landing/styles";
import useCommonStyles from "styles/common-styles";
import { BalanceContainer, StakingContainer, InsurancePool } from "components";

function Item(props: any) {
  const commonClasses = useCommonStyles();
  return (
    <Box className={commonClasses.centeredBox}>
      <Typography color="textSecondary" style={{ color: "#878888" }}>{props.item.name}</Typography>
      <Typography variant="h2" color="secondary">{props.item.description}</Typography>
    </Box>
  )
}

const renderItems = (item: any, index: number) => <Item key={index} item={item} />

function Landing() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  let items = [
    {
      name: "",
      description: "Tips explaining staking size of box small as possible while fitting all info"
    },
    {
      name: "",
      description: "#2 Tips explaining staking size of box small as possible while fitting all info"
    }
  ];

  return (
    <Container className={classes.root}>
      <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>Dashboard</Typography>
      <div className={commonClasses.mainTitleContainer}>
        <Typography variant="subtitle2" color="textSecondary" style={{ color: "#878888" }}>Dashboard</Typography>
        <Typography variant="h2" color="secondary">Welcome to the API3 DAO</Typography>
      </div>
      <div className={commonClasses.marginContainer}>
      <Typography variant="body1" color="secondary">How This Works</Typography>
      <div className={commonClasses.borderContainer} style={{ padding: "5%" }}> 
      <Carousel>
          {items.map(renderItems)}
       </Carousel>
      </div>
      </div>
      <InsurancePool />
      <div style={{ display: "flex" }}>
        <BalanceContainer />
        <StakingContainer />
      </div>
    </Container>
  );
}

export default Landing;