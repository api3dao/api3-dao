import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    chart: {
        width: 172,
        height: 172
    },
    insurancePoolContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "1%"
    },
    subTitle: {
        color: "#999999",
        padding: "3% 0",
        textAlign: "center"
    },
    innerChartText: {
        position: "absolute",
        margin: "auto"
    }
  }),
);

export default useStyles 