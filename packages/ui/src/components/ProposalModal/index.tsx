import React, { useState } from 'react';
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
import { createAppHook, useApp } from '@aragon/connect-react'
import connectVoting from '@aragon/connect-voting'



import Aragon from "services/aragon";

import useStyles from "components/ProposalModal/styles"

// We create a hook corresponding to the app connector. This is usually enough,
// since the app connector will inherit from the connection set on <Connect />.
const useVoting = createAppHook(connectVoting)

function ProposalModal(props: any) {
  const classes = useStyles();
  const { open, handleClose } = props
  const [voting] = useApp('voting')
  // 
  // // And this is how we can use it, by passing the app instance and a callback.
  const [votes] = useVoting(voting, (app) => app.votes())
  const [stakingTarget, setStakingTarget] = useState<number>(0)
  
  const submitProposal = async () => {
    const aragon = await Aragon.getInstance();
    // console.log('aragon', aragon)
    // console.log('useVoting', useVoting)
    console.log('voting', voting)
    console.log('votes', votes)
    aragon.log();
  }
  
  const onSubmit = (event: any) => {
    event.preventDefault();
    submitProposal()
  }
  
  const onChange = (event: any) => {
    console.log('event.target.value', event.target.value)
    const { value } = event.target
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
              New Proposal
            </Typography>
            <form onSubmit={onSubmit} className={classes.form}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="target-amout">Staking target amount</InputLabel>
                  <Input 
                    id="target-amout" 
                    type="number" 
                    onChange={onChange}
                  />
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