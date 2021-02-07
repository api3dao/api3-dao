import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 30,
      padding: 10,
    },
    box: {
      padding: 10
    },
    rejectIcon: {
      color: "#823FB1",
      paddingRight: "3px"
    },
    doneIcon: {
      paddingRight: "3px",
      color: theme.palette.info.main
    },
    activeIcon: {
      paddingRight: "3px"
    },
    proposalSubtitle: {
      "& > *": {
        paddingRight: "4%",
      }
    },
    modal: {
      height: "256px",
      width: "268px",
      padding: "0 2%",
      "& > *": {
        paddingBottom: "7%"
      }
    },
    delegateModal: {
      height: "224px",
      width: "520px",
      padding: "0 2%",
      "& > *": {
        paddingBottom: "7%"
      }
    },
  }),
);

export default useStyles