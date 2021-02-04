import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    proposalitem: {
      borderBottom: "1px solid #404040"
    },
    reject: {
      color: "#823FB1",
      paddingRight: "3px"
    },
    done: {
      paddingRight: "3px",
      color: theme.palette.info.main,
    },
    active: {
      paddingRight: "3px",
    }
  }),
);

export default useStyles