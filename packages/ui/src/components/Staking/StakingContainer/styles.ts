import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input:{
      
    },
    inputText: {
      textAlign: "center"
    },
    modal: {
      height: "224px",
      width: "413px",
      padding: "0 2%",
      "& > *": {
        paddingBottom: "7%"
      }
    },
    nextTabModal: {
      height: "224px",
      width: "413px",
      padding: "0 2%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around"
    },
    cancelButton: {
      padding: "10%"
    }
  })
);

export default useStyles;