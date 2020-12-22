import React, {
  useState,
  SetStateAction,
  Dispatch,
  createContext,
} from "react";

interface ISession {
  votes: any[] | null;
  setVotes: Dispatch<SetStateAction< any | null>>;
}

export const AragonContext = createContext<ISession>({
  votes: [],
  setVotes: () => {},
});

interface IProps {
  children: any;
}

export function AragonProvider(props: IProps) {
  const [votes, setVotes] = useState<any[]>([]);
  const aragonProviderValue = {
    votes,
    setVotes,
  };
  
  return (
    <AragonContext.Provider value={aragonProviderValue}>
        {props.children}
    </AragonContext.Provider>
  );
}

export default AragonProvider;