import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    paddingBox: {
      "& > *": {
        padding: "2%"
      }
    },
  }),
);

export default useStyles;