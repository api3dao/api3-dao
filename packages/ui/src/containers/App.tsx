import React, { useEffect } from "react";
import {
  BrowserRouter,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";

import { AppRouter }from "containers";
import { Navbar } from "components";
import { MainProvider } from "contexts";
import { getEnvVariables } from "utils/environment";

import { theme } from "styles/theme";

function App() {
  const componentDidMount = () => {
    console.log('getEnvVariables()', getEnvVariables());
  }
  useEffect(componentDidMount, [])
  return (
    <div className="App">
      <BrowserRouter>
          <MainProvider>
            <ThemeProvider theme={theme}>
              <Navbar />
              <AppRouter />
            </ThemeProvider>
          </MainProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;