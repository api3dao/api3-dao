import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // border: "1px solid rgb(221, 228, 233)",
      // color:  "unset",
      // backgroundColor: "rgb(221, 228, 233)",
    },
    button: {
      color: "red",
      transition: 'all 0.1s',
      borderBottom: '3px solid #828282',
      textShadow: "0px -1px #828282",
      "&.active": {
        translate: "(0px, 5px)",
        borderBottom: "1px solid"
      }
    },
  }),
);

export default useStyles