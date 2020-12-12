import React, {
  useState,
} from 'react';
import {
  Typography,
  Modal,
  Backdrop,
  Fade,
  FormControl,
  InputLabel,
  Input,
  Button,
  Box,
} from "@material-ui/core";

import Aragon from "services/aragon";
import useStyles from "components/ProposalModal/styles"

function ProposalModal(props: any) {
  const classes = useStyles();
  const { open, handleClose } = props;
  const [stakingTarget, setStakingTarget] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
    
  const submitProposal = async () => {
    const aragon = await Aragon.getInstance();
    let newDescription = `
    ${description} +
    new Staking Target proposed: ${stakingTarget}
    `
    aragon.newVote(stakingTarget, description, handleClose);
  }
  
  const onSubmit = (event: any) => {
    event.preventDefault();
    submitProposal();
  }
  
  const onChangeDescription = (event: any) => {
    const { value } = event.target;
    setDescription(value);
  }
  
  const onChangeStakingTarget = (event: any) => {
    const { value } = event.target;
    setStakingTarget(Number(value));
  }

  return (
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box className={classes.paper}>
            <Typography variant="h2">
              New Staking Target Proposal
            </Typography>
            <form onSubmit={onSubmit} className={classes.form}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="target-amout">Write a description</InputLabel>
                <Input 
                  id="target-amout" 
                  type="text" 
                  onChange={onChangeDescription}
                />
                Description: { description }
              </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="target-amout">Staking target amount</InputLabel>
                  <Input 
                    id="target-amout" 
                    type="number" 
                    onChange={onChangeStakingTarget}
                  />
                  Staking Target: { stakingTarget }
                </FormControl>
                <FormControl>
                  <Button color="inherit" type="submit">
                    Submit proposal
                  </Button>
                </FormControl>
            </form>
          </Box>
        </Fade>
      </Modal>
  );
}

export default ProposalModal;