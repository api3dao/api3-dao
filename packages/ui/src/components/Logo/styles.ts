import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {

    },
    logo: {
      position: "absolute",
      left: "1.56%",
      right: "83.59%",
      top: "18.75%",
      bottom: "18.75%",
      width: "152px",
      height: "60px",

    }
  }),
);

export default useStyles