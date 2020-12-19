import React, {
  useState,
  SetStateAction,
  Dispatch,
  createContext,
} from "react";

// Create Token Interface.
interface Token {
  name: string
  balance: number
}

interface ISession {
  tokens: any | null | Token[];
  setTokens: Dispatch<SetStateAction<any | null>>;
}

export const API3Context = createContext<ISession>({
  tokens: [],
  setTokens: () => {},
});

interface IProps {
  children: any;
}

export function API3Provider(props: IProps) {
  const [tokens, setTokens] = useState<Token[] | null>([]);
  const api3ProviderValue = {
    tokens,
    setTokens
  };

  return (
    <API3Context.Provider value={api3ProviderValue}>
        {props.children}
    </API3Context.Provider>
  );
}

export default API3Provider;