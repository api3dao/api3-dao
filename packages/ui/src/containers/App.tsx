import React from "react";
import {
  BrowserRouter,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";

import { AppRouter }from "containers";
import { Navbar } from "components";
import { theme } from "styles/theme";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Navbar />
          <AppRouter />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;