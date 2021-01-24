import React, { 
  // useContext, 
  // useEffect 
} from 'react';
import { Container, Typography } from '@material-ui/core';
import InsurancePool from "components/InsurancePool";
// import Aragon from "services/aragon";
// import { AragonContext } from "contexts";

import useStyles from "containers/dashboard/styles";
import useCommonStyles from "styles/common-styles";
import Carousel from 'react-material-ui-carousel';
import { Box } from '@material-ui/core';

function Item(props: any) {
    const commonClasses = useCommonStyles();
    return (
        <Box className={commonClasses.centeredBox}>
          <Typography color="textSecondary" style={{ color: "#878888" }}>{props.item.name}</Typography>
          <Typography variant="h2" color="secondary">{props.item.description}</Typography>
        </Box>
    )
}

function Dashboard() {
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  let items = [
    {
        name: "Random Name #1",
        description: "Probably the most random thing you have ever seen!"
    },
    {
        name: "Random Name #2",
        description: "Hello World!"
    }
];
  // const aragonContext = useContext<any>(AragonContext);

  // const componentDidMount = () => {
  //   const getVotes = async () => { 
  //     const aragon = await Aragon.getInstance();
  //     const votes = await aragon.votes();
  //     aragonContext.setVotes(votes);
  //   }
  //   getVotes()
  // }
  // useEffect(componentDidMount, [aragonContext]);
  
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
            {items.map((item, i) => <Item key={i} item={item} /> )}
       </Carousel>
      </div>
      </div>
      <InsurancePool />
    </Container>
  );
}

export default Dashboard;
