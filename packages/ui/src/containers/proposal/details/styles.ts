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
  }),
);

export default useStyles