import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    box: {
      padding: 10
    },
    unstakeAvailableContainer: {
      border: "1px solid #7CE3CB",
      borderRadius: "2px",
    },
  }),
);

export default useStyles;