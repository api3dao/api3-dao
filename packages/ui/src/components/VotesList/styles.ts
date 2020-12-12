import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


const padding10 = {
  padding: 10
}
export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      ...padding10
    },
    voteItem: {
      ...padding10
    },
    voteListTitle: {
      paddingLeft: 10,
    }
  }),
);

export default useStyles