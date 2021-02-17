import React, {
  useState,
} from "react";
import {
  Typography,
  Modal,
  Paper,
  Box,
  TextField,
} from "@material-ui/core";

import { BasicButton } from "components";
import { CloseIcon } from "components/@material-icons";
import useStyles from "components/Modal/styles";

function DelegateModal(props: any) {
  const classes = useStyles();
  const [address, setAddress] = useState("");
  const { setDelegateModal, setDelegateAddress, delegateModal } = props;
  
  const onClose = () => {
    setDelegateModal(false);
  }
  
  const onChange = (event: any) => {
    setAddress(event.target.value);
  }

  const onSubmit = () => {
    onClose();
    setDelegateAddress(address);
  }
  
  return (
    <Modal
      open={delegateModal}
      onClose={onClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height="100%">
        <Box onClick={onClose} marginLeft="23%">
          <CloseIcon color="secondary" fontSize="large" />
        </Box>
        <Paper className={classes.delegate}>
          <Box paddingTop="6%">
            <Typography variant="body1" color="primary">Delegate my votes to:</Typography>
          </Box>
            <TextField 
              required
              onChange={onChange}  
              placeholder="Enter user’s address here" 
              value={address} 
            />
        <Box display="flex" justifyContent="flex-end">
          <BasicButton title="Delegate Tokens" color="white" onClick={() => onSubmit()} />
        </Box> 
        </Paper>
      </Box>
    </Modal>
  );
}

export default DelegateModal;