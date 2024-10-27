import React, { useEffect, useState } from 'react';
import useWallet from '@/wallet/useWallet';
import { Card, Accordion, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
  };
}

interface User {
  address: string;
  cards: PokemonCard[];
}

const Users: React.FC = () => {
  const { details, contract, walletError } = useWallet();
  const [users, setUsers] = useState<User[]>([]);
  const [usersInitialized, setUsersInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  const initUsers = async () => {
    if (!contract || usersInitialized) return;
    try {
      const usersAddresses = await (contract as any).getAllUsers();
      console.log("Users minted:", usersAddresses);

      const usersWithNFTs = await Promise.all(usersAddresses.map(async (address: string) => {
        const cards = await (contract as any).getUserCards(address);
        console.log(`Cards for ${address}:`, cards);

        const cardsData = await axios.get(`http://localhost:3000/get-cards?cards=${cards}`);

        // const uniqueCards = cardsData.data.filter((card: PokemonCard, index: number, self: PokemonCard[]) =>
        //   index === self.findIndex((c) => c.id === card.id)
        // );
        return { address, cards: cardsData.data };
      }));

      const filteredUsersWithNFTs = usersWithNFTs.filter(Boolean) as User[];
      setUsers(filteredUsersWithNFTs);

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false); // Stop loading when done
    }
    setUsersInitialized(true);
  };

  useEffect(() => {
    initUsers();
  }, [contract]);

  useEffect(() => {
    console.log("USERS - Current context value:", { details, contract, walletError });
  }, [details, contract, walletError]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ maxWidth: '800px', marginTop: '20px' }}>
      <div style={{ width: '100%' }}>
        <h2 className="text-center mb-4">Users Page</h2>

        {/* Display spinner while loading */}
        {isLoading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Accordion defaultActiveKey="0">
            {users.map((user, index) => (
              <Accordion.Item eventKey={index.toString()} key={user.address} className="mb-3">
                <Accordion.Header className="text-light bg-primary">{user.address}</Accordion.Header>
                <Accordion.Body style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="row">
                    {user.cards.map((card, cardIndex) => (
                      <div className="col-md-3 text-center mb-4" key={card.id}>
                        <Card
                          style={{
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                            borderRadius: '8px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Card.Img
                            variant="top"
                            src={card.images.small}
                            alt={`Card ${cardIndex}`}
                            style={{ borderRadius: '8px 8px 0 0' }}
                          />
                          <Card.Body>
                            <Card.Title>{card.name}</Card.Title>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </Container>
  );
};

export default Users;
