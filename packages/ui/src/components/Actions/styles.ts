import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      padding: 10
    },
  }),
);

export default useStyles;