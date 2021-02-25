import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
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
    input: {
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: "1px solid #000000",
      fontSize: "16 !important",
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    }
  }),
);

export default useStyles