import React from 'react';
import { 
  Container,
  List,
  ListItem,
  ListItemText,

} from '@material-ui/core';


import useStyles from "containers/claims/styles";

function Claims() {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
    <List dense className={classes.root}>
    {[0, 1, 2, 3].map((value) => {
      return (
        <ListItem key={value}>
          <ListItemText primary={`Claims item #${value + 1}`} />
        </ListItem>
      );
    })}
  </List>
    </Container>
  );
}

export default Claims;