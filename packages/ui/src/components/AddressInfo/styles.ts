import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
    },
  }),
);

export default useStyles