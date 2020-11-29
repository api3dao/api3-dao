import React from "react";
import { 
  Connect,
} from '@aragon/connect-react'
import {
  BrowserRouter,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";

import { AppRouter }from "containers";
import { Navbar } from "components";
import { Web3Provider } from "contexts";

import { theme } from "styles/theme";

function App() {
  const testAragonDAO = "w3api.aragonid.eth"
  return (
    <div className="App">
      <BrowserRouter>
        <Connect location={testAragonDAO} connector="thegraph">
          <Web3Provider>
            <ThemeProvider theme={theme}>
              <Navbar />
              <AppRouter />
            </ThemeProvider>
          </Web3Provider>
        </Connect>
      </BrowserRouter>
    </div>
  );
}

export default App;