import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    button: {
      backgroundColor: "#000 !important",
      border: "1px solid #878888",
      padding: "16px 28px",
      color: "#fff",
      fontSize: "18px",
      fontWeight: 400,
      width: "100%",
      position: "relative",
      cursor: "pointer",
      display: "block",
      textAlign: "center",
      "&::before": {
          content: "''",
          width: "calc(100% + 1px)",
          height: "calc(100% + 1px)",
          border: "1px solid #878888",
          position: "absolute",
          top: "-1px",
          left: "-1px",
          zIndex: -1,
          transition: "all .3s"
      },
      "&::after": {
        content: "''",
        width: 0,
        height: "calc(100% + 2px)",
        background: "linear-gradient(90deg, #7ce3cb 0%, #777ca1 100%)",
        position: "absolute",
        top: "-1px",
        left: "-1px",
        zIndex: -1,
        transition: "all .3s"
      },  
    },
    firstSpan: {
      marginTop: "3px",
      borderBottom: "1px solid #878888",
      display: "flex",
      bottom: "-6px",
    },
    secondSpan: {
      content: "''",
      width: 0,
      height: "1px",
      background: "linear-gradient(90deg, #7ce3cb 0%, #777ca1 100%)",
      position: "absolute",
      bottom: "-6px",
      left: "-1px",
      transition: "all .3s"
    }
  }),
);

export default useStyles;