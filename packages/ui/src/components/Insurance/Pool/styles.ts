import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    chart: {
        width: 172,
        height: 172
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