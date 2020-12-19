import React, {
  createContext,
} from "react";

import { Web3Provider, API3Provider } from "contexts";

// Here we will add all Contexts needed versus adding them inside containers/App.tsx.

interface ISession {

}

export const MainContext = createContext<ISession>({

});

interface IProps {
  children: any;
}

export function MainProvider(props: IProps) {
  const mainProviderValue = {};

  return (
    <MainContext.Provider value={mainProviderValue}>
      <Web3Provider>
        <API3Provider>
          { props.children }
        </API3Provider>
      </Web3Provider>
    </MainContext.Provider>
  );
}

export default MainProvider;

