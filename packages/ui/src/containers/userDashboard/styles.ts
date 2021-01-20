import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 30,
      padding: 10,
    },
    box: {
      padding: 10
    }
  }),
);

export default useStyles