import React, { useEffect, useMemo, useRef, useState } from 'react';
import WalletContext from "./WalletContext";

import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';

type Canceler = () => void;

const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>();
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncaught error', error));
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current();
        cancelerRef.current = undefined;
      }
    };
  }, dependencies);
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [details, setDetails] = useState<ethereum.Details | undefined>();
  const [contract, setContract] = useState<main.Main | undefined>();
  const [walletError, setWalletError] = useState<string | null>(null);

  useAffect(async () => {
    try {
      const details_ = await ethereum.connect('metamask');
      if (!details_) throw new Error("Failed to connect wallet.");
      
      setDetails(details_);
      const contract_ = await main.init(details_);
      if (!contract_) throw new Error("Failed to initialize contract.");

      setContract(contract_);
    } catch (error) {
      setWalletError((error as Error).message || "Error initializing wallet.");
      console.error(error);
    }
  }, []);

  // Memoize the context value to avoid unnecessary re-renders
  const walletContextValue = useMemo(() => {
    return { details, contract, walletError };
  }, [details, contract, walletError]);

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
