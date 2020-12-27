import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {

    },
    logo: {
      height: 50,
      width: 50,
    }
  }),
);

export default useStyles