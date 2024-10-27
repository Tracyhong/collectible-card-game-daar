import React, { useEffect, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useWallet from '@/wallet/useWallet'; 

interface PokemonSet {
  id: string;
  name: string;
  images: {
    logo: string;
  };
}

const Sets: React.FC = () => {
  const { details, contract, walletError } = useWallet();
  const navigate = useNavigate();

  const handleSetClick = (setId: string) => {
    navigate(`/cards/${setId}`);
  };

  const [pokemonSetsInitialized, setPokemonSetsInitialized] = useState(false);
  const [pokemonSets, setPokemonSets] = useState<PokemonSet[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  const initializePokemonSets = async () => {
    try {
      console.log('Init collections for Pokémon sets...');
      console.log("wallet.contract", contract);
      console.log("wallet.details", details);

      const collections = await (contract as any).getAllCollectionNames();

      if (collections) {
        const url = `http://localhost:3000/init-pokemon-sets?collections=${collections}`;
        console.log('call URL:', url);
        const response = await axios.get(url);
        if (response) {
          console.log("response.data", response.data);
          setPokemonSets(response.data);
          setPokemonSetsInitialized(true);
        }
      }
    } catch (error) {
      console.error('Error initializing Pokémon sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current context value:", { details, contract, walletError });
    if (contract && !pokemonSetsInitialized) {
      initializePokemonSets();
    }
  }, [details, contract, walletError]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Pokémon Card Sets</h2>

      {/* Display spinner while loading */}
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className="row justify-content-center">
          {pokemonSets.map((set) => (
            <div
              className="col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-4"
              key={set.id}
              onClick={() => handleSetClick(set.id)}
              style={{ cursor: 'pointer' }}
            >
              <Card
                style={{
                  width: '18rem',
                  height: '340px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                className="hover-card"
              >
                <Card.Img
                  variant="top"
                  src={set.images.logo}
                  alt={set.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'contain',
                    borderRadius: '8px 8px 0 0',
                  }}
                />
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <Card.Title
                    style={{
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    {set.name}
                  </Card.Title>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Custom styles for hover effect */}
      <style>{`
        .hover-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Sets;
