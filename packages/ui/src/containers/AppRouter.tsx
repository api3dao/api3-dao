import React from "react";
import {
  Switch,
  Route,
} from "react-router-dom";

import { 
  Dashboard,
  Claims,
  DAOGov,
  Proposals,
  Staking,

} from "containers";

function AppRouter() {
  return (
      <Switch>
        <Route path={"/claims"}>
          <Claims />
        </Route>
        <Route path={"/dao-gov"}>
          <DAOGov />
        </Route>
        <Route path={"/staking"}>
          <Staking />
        </Route>
        <Route path={"/proposals"}>
          <Proposals />
        </Route>
        <Route path={["/dashboard", "/"]}>
          <Dashboard />
        </Route>
      </Switch>
  );
}

export default AppRouter;