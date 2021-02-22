import React, {
  useState,
  SetStateAction,
  Dispatch,
  createContext,
} from "react";

interface ISession {
  votes: any[] | null;
  setVotes: Dispatch<SetStateAction< any | null>>;
  vote: any;
  setVote: Dispatch<SetStateAction< any | null>>;
}

export const AragonContext = createContext<ISession>({
  votes: [],
  setVotes: () => {},
  vote: {},
  setVote: () => {}
});

interface IProps {
  children: any;
}

export function AragonProvider(props: IProps) {
  const [votes, setVotes] = useState<any[]>([]);
  const [vote, setVote] = useState<any>(null);
  const aragonProviderValue = {
    votes,
    setVotes,
    vote, 
    setVote,
  };
  
  return (
    <AragonContext.Provider value={aragonProviderValue}>
        {props.children}
    </AragonContext.Provider>
  );
}

export default AragonProvider;