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
  Checkbox,
  FormControlLabel,

} from "@material-ui/core";

import { Voting } from "services/aragon";

import useStyles from "components/Proposals/ProposalModal/styles"

function ProposalModal(props: any) {
  const classes = useStyles();
  const { open, handleClose } = props;
  const [stakingTarget, setStakingTarget] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("Staking Target");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const submitCallback = () => {
    setSubmitting(false);
    handleClose();
  }
  
  const submitProposal = async () => {
    // Some logic should be applied here to submit different type of proposals dynamically.
    let newDescription = `
      ${description} +
      new Staking Target proposed: ${stakingTarget}
    `;
    const voting = await Voting.getInstance();
    voting.newVote(newDescription, submitCallback);
  }
  
  const onSubmit = (event: any) => {
    event.preventDefault();
    setSubmitting(true);
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

  const onChangeProposalType = (event: any ) => {
    const { value } = event.target;
    setType(value);
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
            <Typography variant="h4">
              New Proposal
            </Typography>
            <form onSubmit={onSubmit} className={classes.form}>  
              <div className={classes.checkboxes}>
                <FormControlLabel
                  label="Staking Target"
                  control={
                    <Checkbox
                      // checked={state.checkedB}
                      onChange={onChangeProposalType}
                      name="staking"
                      checked={type === "Staking Target"}
                      color="primary"
                      value="Staking Target"
                    />}
                />
                <FormControlLabel
                  label="Grants"
                  control={
                    <Checkbox
                      // checked={state.checkedB}
                      onChange={onChangeProposalType}
                      name="grants"
                      checked={type === "Grants"}
                      color="primary"
                      value="Grants"
                    />}
                  />  
                <FormControlLabel
                    label="Governance"
                    control={
                      <Checkbox
                        // checked={state.checkedB}
                        onChange={onChangeProposalType}
                        name="dao"
                        checked={type === "Governance"}
                        color="primary"
                        value="Governance"
                      />}
                    />  
              </div>

              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="target-amout">Write a description</InputLabel>
                <Input 
                  id="target-amout" 
                  type="text" 
                  onChange={onChangeDescription}
                />
              </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="target-amout">Amount</InputLabel>
                  <Input 
                    id="target-amout" 
                    type="number" 
                    onChange={onChangeStakingTarget}
                  />

                </FormControl>
                <FormControl>
                  <Button color="inherit" type="submit" disabled={submitting}>
                    { !submitting ? "Submit proposal" : "Submitting... Please Wait"}
                  </Button>
                </FormControl>
            </form>
            <Box className={classes.preview}>
              <p>
                Proposal type: { type }
              </p>
              {
                type === "Staking Target" && (
                  <p>
                    Preview Staking Target: { stakingTarget }
                  </p>
                )
              }
              <p>
                Preview Description: { description }
                </p>
            </Box>
          </Box>
        </Fade>
      </Modal>
  );
}

export default ProposalModal;