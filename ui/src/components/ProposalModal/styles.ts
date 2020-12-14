import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      // padding: theme.spacing(2, 4, 3),
      padding: 50,
      height: "50%",
      width: "50%",
    },
    form: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
    },
    formControl: {
      paddingBottom: 50,
    }
  }),
);

export default useStyles
