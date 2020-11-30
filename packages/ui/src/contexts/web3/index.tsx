import React, {
  useState,
  SetStateAction,
  Dispatch,
  createContext,
} from "react";

interface ISession {
  address: string | null;
  setAddress: Dispatch<SetStateAction<string | null>>;
}

export const Web3Context = createContext<ISession>({
  address: null,
  setAddress: () => {},
});

interface IProps {
  children: any;
}

export function Web3Provider(props: IProps) {
  const [address, setAddress] = useState<string | null>(null);
  const web3ProviderValue = {
    address,
    setAddress,
  };
  
  return (
    <Web3Context.Provider value={web3ProviderValue}>
        {props.children}
    </Web3Context.Provider>
  );
}

export default Web3Provider;