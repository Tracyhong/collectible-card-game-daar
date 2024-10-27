import { useContext } from 'react';
import WalletContext from './WalletContext';

// This hook simplifies the access to wallet context data
const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  return context;
};

export default useWallet;
