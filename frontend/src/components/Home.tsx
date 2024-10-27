// Home.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import useWallet from '@/useWallet'; 

const Home: React.FC = () => {
  
  const { details, contract }  = useWallet();
  const [users, setUsers] = useState<string[]>([]); // To manage users
  const [usersInitialized, setUsersInitialized] = useState(false);
  const addUser = () => {
    if (details) {
      const usersWallet = details.account;
      console.log("Users in wallet:", usersWallet);
  
      if (usersWallet) {
        setUsers(existingUsers => {
          if (Array.isArray(usersWallet)) {
            // Filter new wallets that are not already in the state
            const newWallets = usersWallet.filter(wallet => !existingUsers.includes(wallet));
            // Add all new wallets at once
            return [...existingUsers, ...newWallets];
          } else {
            // Handle single wallet case
            if (!existingUsers.includes(usersWallet)) {
              return [...existingUsers, usersWallet];
            }
          }
          return existingUsers; // If nothing to add, return the existing state
        });
      }
    } else {
      console.log("Wallet is not available");
    }
    setUsersInitialized(true);
  };

  useEffect(() => {
    
    // if (!contract) return alert("Wallet not connected.");
    if (contract && !usersInitialized) {
      // if(!pokemonSetsInitialized) initializePokemonSets();
      addUser();
    }
  }, [contract]);

  return (
    <div className="container text-center" style={{ padding: '20px' }}>
      <h2 className="mb-4" style={{ fontSize: '2.5rem' }}>Welcome to Pokémon TCG</h2>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/1200px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png" 
        alt="Pokémon Trading Card Game Logo" 
        style={{ width: '400px', height: 'auto', margin: '20px 0', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
      />
      {users.length > 0 ? (
        <h4 className="mb-3" style={{ fontSize: '1.2rem', color: '#555' }}>Connected as: <strong>{users[0]}</strong></h4>
      ) : (
        <h4 className="mb-3" style={{ fontSize: '1.2rem', color: '#555' }}>Connecting you...</h4>
      )}
    </div>
  );
};

export default Home;
