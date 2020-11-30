import { createMuiTheme } from "@material-ui/core/styles";

const palette = {
  primary: {
    main: "#000000de", // black
    light: "#738DCE", // dark blue
    dark: "#000000",
  },
  secondary: {
    main: "#FFFFFF", // white
    light: "#0059E2", // real blue
  },
  text: {
    primary: "#000", // black
    secondary: "#4A4A4A",
    light: "#F7F7F7",
  },
  info: {
    main: "#0034B6", // darkblue
  },
};

export const theme = createMuiTheme({
  palette,
  typography: {
    h1: {
      fontSize: "42px",
      lineHeight: "42px",
    },
    h2: {
      fontSize: "27px",
      lineHeight: "133.84%",
    },
    h3: {
      fontSize: "20px",
      lineHeight: "143%",
    },
    body1: {
      fontSize: "16px",
      lineHeight: "143%",
    },
    body2: {
      fontWeight: "normal",
      fontSize: "16px",
      lineHeight: "143%",
    },
    subtitle1: {
      fontSize: "22px",
      lineHeight: "28px",
    },
    h4: {
      fontSize: "28px",
      lineHeight: "28px",
      fontWeight: 600,
      marginBottom: 6,
      color: "#000000",
    },
    subtitle2: {
      textAlign: "initial",
      fontSize: 14,
    },
  },
  overrides: {
    MuiInputBase: {
      // input: {
      //   fontSize: 16,
      //   "&:focus": {
      //     borderColor: "#0034B6",
      //     // border: '1px solid black',
      //   },
      //   "&:active": {
      //     borderColor: "#0034B6 !important",
      //     // border: '1px solid black',
      //   },
      //   "&:hover": {
      //     borderBottom: "none",
      //     transition: "none",
      //   },
      // },
    },
    MuiInput: {
      // underline: {
      //   "&:before": {
      //     borderBottom: "none",
      //     transition: "none",
      //   },
      //   "&:after": {
      //     borderBottom: "none",
      //     transition: "none",
      //   },
      //   "&:hover": {
      //     borderBottom: "none",
      //     transition: "none",
      //   },
      //   "&:focus": {
      //     borderColor: "#0034B6",
      //     // border: '1px solid black',
      //   },
      //   "&:active": {
      //     borderColor: "#0034B6 !important",
      //     // border: '1px solid black',
      //   },
      // },
    },
    MuiOutlinedInput: {
      // root: {
      //   borderRadius: 0,
      //   fontSize: 14,
      //   width: "100%",
      //   padding: "0px !important",
      //   "&:focus": {
      //     borderColor: "#0034B6",
      //     // border: '1px solid black',
      //   },
      //   "&:active": {
      //     borderColor: "#0034B6 !important",
      //     // border: '1px solid black',
      //   },
      //   "&:placeholder": {
      //     fontFamily: "NimbusSans-Regular",
      //     fontSize: 16,
      //     color: "black",
      //   },
      //   "&:label": {
      //     color: "black",
      //   },
      //   "&$focused $notchedOutline": {
      //     borderColor: "#0034B6",
      //     borderWidth: 1,
      //     color: "#0034B6",
      //   },
      // },
      // inputAdornedStart: {
      //   border: "none",
      // },
      // input: {
      //   padding: 0,
      //   width: "100%",
      //   // border: "1px solid black",
      //   borderRadius: 2,
      //   height: "40px",
      //   background: "#fff",
      //   fontSize: 16,
      //   fontWeight: 400,
      //   paddingLeft: 4,
      //   boxSizing: "border-box",
      //   outline: "none",
      //   "&:focus": {
      //     borderColor: "#0034B6",
      //     // border: '1px solid black',
      //   },
      //   "&:active": {
      //     borderColor: "#0034B6 !important",
      //     // border: '1px solid black',
      //   },
      //   "&:placeholder": {
      //     fontFamily: "NimbusSans-Regular",
      //     fontSize: 16,
      //     color: "black",
      //   },
      // },
      // notchedOutline: {
      //   border: "0.5px solid",
      //   // borderColor: '#0034B6',
      //   borderColor: "black",
      //   borderRadius: 2,
      //   "&:focus": {
      //     border: "0.5px solid",
      //     // borderColor: 'black',
      //     borderColor: "#0034B6",
      //     borderRadius: 2,
      //   },
      //   "&:active": {
      //     border: "0.5px solid",
      //     // borderColor: 'black',
      //     borderColor: "#0034B6",
      //     borderRadius: 2,
      //   },
      //   "&:placeholder": {
      //     fontFamily: "NimbusSans-Regular",
      //     fontSize: 16,
      //     color: "black",
      //   },
      //   "& legend": {
      //     // visibility: "visible",
      //     // width: '100%',
      //     // maxWidth: "100%",
      //   },
      //   "& .PrivateNotchedOutline-legendLabelled-25 > span": {
      //     paddingLeft: 18,
      //     // visibility: "visible",
      //   },
      //   "& .PrivateNotchedOutline-legendLabelled-22 > span": {
      //     paddingLeft: 18,
      //   },
      // },
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
    MuiButton: {
      // label: {
      //   textTransform: "initial",
      //   fontSize: "14px",
      //   lineHeight: "24px",
      //   padding: 4,
      //   fontWeight: 500,
      // },
      root: {
        // borderRadius: 0,
        // color: 'unset'
      },
      // contained: {
      //   boxShadow: "unset",
      //   "&:hover": {
      //     boxShadow: "unset",
      //     backgroundColor: "#738DCE",
      //   },
      //   "&:disabled": {
      //     background: "#CCD1DB",
      //     backgroundColor: "#CCD1DB",
      //     color: "#fff",
      //     borderRadius: "4px",
      //     // width: "50%",
      //   },
      // },
    },
    MuiButtonBase: {
      root: {
        border: "solid"
      }
    },
    MuiSelect: {
      // root: {
      //   textAlign: "initial",
      //   fontSize: 14,
      //   "& placeholder": {
      //     color: "red",
      //   },
      //   "& .MuiSelect-select": {
      //     color: "#000",
      //   },
      // },
      // selectMenu: {
      //   fontSize: 16,
      //   color: "#7a7a7a",
      //   background: "#FFF",
      // },
      // select: {
      //   color: "#000",
      //   "& .MuiSelect-select": {
      //     color: "#000",
      //   },
      // },
      // outlined: {
      //   color: "#000",
      // },
    },
  },
});