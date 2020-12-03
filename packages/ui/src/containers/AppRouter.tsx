import React from 'react';
import {
  Switch,
  Route,
} from "react-router-dom";

import { Dashboard } from "containers";

function AppRouter() {
  return (
      <Switch>
        <Route path={["/dashboard", "/"]}>
          <Dashboard />
        </Route>
      </Switch>
  );
}

export default AppRouter;