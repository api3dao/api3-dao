import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useCommonStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    textBackground: {
        position: "absolute",
        color: "#191919",
        zIndex: -900,
        fontSize: 131,
        fontWeight: 500
    },
    mainTitleContainer: {
        marginLeft: "32px"
    },
    borderContainer: {
      border: "1px solid #F3F3F3",
      margin: "5px"
    },
    centeredBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      padding: "5%"
    },
    marginContainer: {
      marginTop: "6%"
    }
  }),
);

export default useCommonStyles;