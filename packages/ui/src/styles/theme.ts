import { createMuiTheme } from "@material-ui/core/styles";
import { palette } from "styles/palette";
import { overrides } from "styles/overrides";
import { typography } from "styles/typography";

export const theme = createMuiTheme({
  palette,
  ...typography,
  overrides,
});