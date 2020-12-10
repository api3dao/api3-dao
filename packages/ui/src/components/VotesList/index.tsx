import React, { useState } from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import Aragon from "services/aragon";
import { Votes, Vote } from "services/aragon/types";

// import useStyles from "components/VotesList/styles";

function VotesList() {
  const [votes, setVotes] = useState<Votes>([]);
  const getVotes = async () => { 
    const aragon = await Aragon.getInstance();
    aragon.votes();
    setVotes(await aragon.votes());
    console.log('votes', votes);
  }
  
  return (
    <Box>
      <Button onClick={getVotes} color="inherit">Get Votes</Button>
    </Box>
  );
}

export default VotesList;