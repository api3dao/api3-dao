import React from "react";
import {
  BrowserRouter,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";

import { AppRouter }from "containers";
import { Navbar } from "components";
import { Web3Provider } from "contexts";

import { theme } from "styles/theme";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Web3Provider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <AppRouter />
          </ThemeProvider>
        </Web3Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;