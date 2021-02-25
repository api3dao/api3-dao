import { Overrides } from "@material-ui/core/styles/overrides";

export const overrides: Overrides = {
  MuiContainer: {
    root: {
      
    },
  },
  MuiTypography: {
    root: {
      
    },
  },
  MuiTextField: {
    root: {
      backgroundColor: "#FFFFFF",
      color: "black",
      borderRadius: 0,
      width: "100%",
      "&:focus": {
        border: "0.5px solid",
        // borderColor: 'black',
        borderColor: "#0034B6",
        borderRadius: 2,
      },
      "&:active": {
        border: "0.5px solid",
        // borderColor: 'black',
        borderColor: "#0034B6",
        borderRadius: 2,
      },
      "&:placeholder": {
        color: "black",
      },
    },
  },
  MuiButtonBase: {
    root: {
      border: "solid"
    }
  },
  MuiCheckbox: {
    root: {
      border: "unset",
    }
  },
  MuiListItem: {
    root: {
      border: "unset"
    }
  },
  MuiRadio: {
    root: {
      border: "unset"
    }
  }
}