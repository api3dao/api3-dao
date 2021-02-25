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
  ProtectedRouter,
} from "containers";

function AppRouter() {
  return (
    <Switch>
      <ProtectedRouter path="/dashboard" component={Dashboard} />
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
      <Route path={"/"}>
        <Landing />
      </Route>
    </Switch>
  );
}

export default AppRouter;