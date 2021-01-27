import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "15vw",
      height: "132vh",
    },
    bar: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      height: "100vh",
      marginTop: "35px",
      padding: 0
    },
    title: {
      height: '6%',
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingLeft: '19%',
      color: "white",
      textDecoration: "unset",
    },
    link: {
      color: "white",
      textDecoration: "unset",
    },
    logo: {
      width: 18,
      height: 18,
      marginTop: '5px',
      marginRight: '9.5px',
    },
    activebar: {
      background: 'linear-gradient(90deg, rgba(124,227,203,1) 4%, rgba(3,3,3,1) 4%)',
    },
  }),
);

export default useStyles;