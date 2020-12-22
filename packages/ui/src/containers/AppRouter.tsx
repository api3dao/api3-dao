import React from "react";
import {
  Switch,
  Route,
} from "react-router-dom";

import { 
  Dashboard,
  Claims,
  DAOGov,
  Staking,

} from "containers";

function AppRouter() {
  return (
      <Switch>
        <Route path={"/claims"}>
          <Claims />
        </Route>
        <Route path={"/dao"}>
          <DAOGov />
        </Route>
        <Route path={"/staking"}>
          <Staking />
        </Route>
        <Route path={["/dashboard", "/"]}>
          <Dashboard />
        </Route>
      </Switch>
  );
}

export default AppRouter;