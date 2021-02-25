import React, {
  useState,
  SetStateAction,
  Dispatch,
  createContext,
} from "react";

interface ISession {
  address: string | null;
  setAddress: Dispatch<SetStateAction<string | null>>;
  isConnected: boolean;
  disconnect(): void;
}

export const Web3Context = createContext<ISession>({
  address: null,
  setAddress: () => {},
  isConnected: false,
  disconnect: () => {}
});

interface IProps {
  children: any;
}

export function Web3Provider(props: IProps) {
  const [address, setAddress] = useState<string | null>(null);
  const disconnect = () => {
    setAddress(null)
  }
  const isConnected = (address && true) as boolean; 
  const web3ProviderValue = {
    address,
    setAddress,
    disconnect,
    isConnected,
  };
  
  return (
    <Web3Context.Provider value={web3ProviderValue}>
        {props.children}
    </Web3Context.Provider>
  );
}

export default Web3Provider;