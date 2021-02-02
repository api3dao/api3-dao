import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // border: "1px solid rgb(221, 228, 233)",
      // color:  "unset",
      // backgroundColor: "rgb(221, 228, 233)",
    },
    button: {
      marginRight: 10,
    }
  }),
);

export default useStyles