import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useCommonStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    textBackground: {
        position: "absolute",
        color: "#191919",
        zIndex: -20,
        fontSize: 131,
        fontWeight: 500
    },
    mainTitleContainer: {
      marginLeft: "32px"
    },
    borderContainer: {
      border: "1px solid #F3F3F3",
      margin: "5px 0",
      borderRadius: "2px"
    },
    centeredBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    },
    marginContainer: {
      marginTop: "6%"
    },
    titleWithButton: {
      display: "flex",
      justifyContent: "space-between"
    },
    leftBox: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }),
);

export default useCommonStyles;