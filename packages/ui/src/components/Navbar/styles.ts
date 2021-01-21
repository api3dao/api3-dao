import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    link: {
      color: "white",
      "&:visited": {
        color: 'unset',
      },
      textDecoration: "unset",
    },
    header: {
      display: "flex",
      justifyContent: "space-between"
    },
    addressContainer: {
      display: "flex",
      flexDirection: "row"
    },
    logo: {
      width: 18,
      height: 18,
      marginTop: '5px',
      marginRight: '9.5px'
    }
  }),
);

export default useStyles;