import React, {
  useState,
} from "react";
import {
  Typography,
  Modal,
  Paper,
  FormControl,
  Radio,
  RadioGroup,
  Box,
  FormControlLabel,
} from "@material-ui/core";

import { BasicButton } from "components";
import { CloseIcon, } from "components/@material-icons";
import useStyles from "components/Modal/styles";

function VoteModal(props: any) {
  const classes = useStyles();
  const { voteIndex, voteModal, setVoteModal, setVoted } = props;
  const [voter, setVoter] = useState('');
  
  const onChange = (event: any) => {
    setVoter(event.target.value)
  } 
  
  const onClose = () => {
    setVoteModal(false);
  }
  
  const onSubmit = () => {
    onClose();
    setVoted(voter);
  }
  
  return (
    <Modal
      open={voteModal}
      onClose={onClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height="100%">
      <Box onClick={onClose} marginLeft="23%">
        <CloseIcon color="secondary" fontSize="large" />
      </Box>
      <Paper className={classes.vote}>
      <Typography variant="body1" color="primary">Vote on Proposal {voteIndex}</Typography>
      <FormControl>
      <RadioGroup aria-label="gender" name="gender1" value={voter} onChange={onChange}>
        <FormControlLabel value="for" control={<Radio />} label="For" />
        <FormControlLabel value="against" control={<Radio />} label="Against" />
      </RadioGroup>
      </FormControl>
      <Box>
        <BasicButton title="Create Transaction" color="white" onClick={() => onSubmit()} />
      </Box> 
      </Paper>
    </Box>
    </Modal>
  )
}

export default VoteModal;