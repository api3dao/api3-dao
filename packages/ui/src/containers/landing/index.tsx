import React, { } from "react";
import { Container, Typography, Box } from "@material-ui/core";
import Carousel from "react-material-ui-carousel";

import useStyles from "containers/landing/styles";
import useCommonStyles from "styles/common-styles";
import { BalanceContainer, StakingContainer, InsurancePool } from "components";

function Item(props: any) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
      <Typography color="textSecondary">{props.item.name}</Typography>
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
      <Typography variant="h1" color="textSecondary" className={commonClasses.textBackground}>
        Dashboard
      </Typography>
      <Box marginLeft="32px">
        <Typography variant="subtitle2" color="textSecondary">
          Dashboard
        </Typography>
        <Typography variant="h2" color="secondary">
          Welcome to the API3 DAO
        </Typography>
      </Box>
      <Box marginTop="6%">
        <Typography variant="body1" color="secondary">
          How This Works
        </Typography>
        <Box padding="5%" className={commonClasses.borderContainer}> 
          <Carousel autoPlay={false} navButtonsAlwaysVisible>
            { items.map(renderItems) }
          </Carousel>
        </Box>
      </Box>
      <InsurancePool />
      <Box display="flex">
        <BalanceContainer />
        <StakingContainer />
      </Box>
    </Container>
  );
}

export default Landing;