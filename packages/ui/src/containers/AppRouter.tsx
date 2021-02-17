import React from "react";
import {
  Switch,
  Route,
} from "react-router-dom";

import { 
  Dashboard,
  DAOGov,
  Staking,
  ProposalDetails,
  Landing,
  Testing,

} from "containers";

function AppRouter() {
  return (
    <Switch>
      <Route path={"/testing"}>
        <Testing  />
      </Route>
      <Route exact path={"/proposals"}>
        <DAOGov />
      </Route>
      <Route path={"/proposals/:id"}>
        <ProposalDetails />
      </Route>
      <Route path={"/staking"}>
        <Staking />
      </Route>
      <Route path={"/dashboard"}>
        <Dashboard />
      </Route>
      <Route path={"/"}>
        <Landing />
      </Route>
    </Switch>
  );
}

export default AppRouter;