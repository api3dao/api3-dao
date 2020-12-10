import React, { useContext } from "react";
import {
  Box,
  Button,
} from "@material-ui/core";

import Aragon from "services/aragon";

// import useStyles from "components/VoteProposalButton/styles";

function VoteProposalButton() {
  
  const vote = async () => { 
    const aragon = await Aragon.getInstance();
    aragon.vote();
  }
  
  return (
    <Box>
      <Button onClick={vote} color="inherit">Vote</Button>
    </Box>
  );
}

export default VoteProposalButton;