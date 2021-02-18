import React, { Component, useContext } from "react";
import {
  Redirect,
  Route,
  RouteProps,
} from "react-router-dom";

import {
  Web3Context,
} from "contexts"

interface IProtectedRouter extends Omit<RouteProps, "component"> {
  component: Component | any
  otherProps?: any
  path: string
}

export function ProtectedRouter({component: Component, otherProps, path}: IProtectedRouter) {
  const web3Context = useContext(Web3Context);
  const { isConnected, disconnect } = web3Context;
  return (
    <Route
      {...otherProps}
      path={path}
      render={(props) => {
        if (isConnected) {
          return <Component disconnect={disconnect} />;
        } else {
          return (
            <Redirect to={{ pathname: "/", state: { from: props.location } }} />
          );
        }
      }}
    />
  );
}

export default ProtectedRouter;