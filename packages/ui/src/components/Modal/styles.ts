import { InputBase } from "@material-ui/core";
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';

const modals = { 
  vote: {
    height: "256px",
    width: "268px",
    padding: "0 2%",
    "& > *": {
      paddingBottom: "7%"
    }
  },
  delegate: {
    height: "224px",
    width: "520px",
    padding: "0 2%",
    "& > *": {
      paddingBottom: "7%"
    }
  },
  newProposal: {
    height: "573px",
    width: "529px",
    borderRadius: 2,
    padding: "16px"
  },
  newProposalWithOther: {
    height: "716px",
    width: "529px",
    borderRadius: 2,
    padding: "16px"
  },
  newProposalType2: {
    width: "529px",
    borderRadius: 2,
    padding: "16px"
  },
}

export const CustomSelect = withStyles((theme: Theme) =>
  createStyles({
    root: {
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: "1px solid #000000",
      fontSize: "16px",
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }),
)(InputBase);

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    input: {
      border: "1px solid #000000",
      paddingLeft: "16px",
      paddingTop: "6px",
      fontSize: 16,
    },
    ...modals,
  }),
);

export default useStyles;