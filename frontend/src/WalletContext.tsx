// import { createContext } from 'react';

// const WalletContext = createContext<any>(undefined);

// export default WalletContext;
import { createContext } from 'react';
import * as ethereum from '@/lib/ethereum';
import * as main from '@/lib/main';

// Define the shape of your WalletContext
export interface WalletContextType {
  details?: ethereum.Details;
  contract?: main.Main;
  walletError?: string | null;
}

const WalletContext = createContext<WalletContextType>({
  details: undefined,
  contract: undefined,
  walletError: null,
});

export default WalletContext;
