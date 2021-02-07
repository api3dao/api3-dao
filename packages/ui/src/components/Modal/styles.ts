import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

interface Props {
  color: 'black' | 'white' | 'disabled' ;
}


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
  }
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    ...modals,
  }),
);

export default useStyles;