import React from "react";
import {
  BrowserRouter,
} from "react-router-dom";

import { AppRouter }from "containers";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
