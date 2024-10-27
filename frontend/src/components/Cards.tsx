import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Modal, Button, Carousel } from 'react-bootstrap';
import axios from 'axios';
import { ethers } from 'ethers';
import Dropdown from 'react-bootstrap/Dropdown';
import useWallet from '@/wallet/useWallet';

interface PokemonCard {
  id: string;
  name: string;
  set: {
    name: string;
  };
  images: {
    small: string;
  };
}

const Cards: React.FC = () => {
  const { details, contract, walletError } = useWallet();
  const { setId } = useParams<{ setId: string }>();
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set()); 
  const [userAddress, setUserAddress] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);
  const [usersInitialized, setUsersInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMintedModal, setShowMintedModal] = useState(false);
  const [mintedCards, setMintedCards] = useState<PokemonCard[]>([]);


  const initUsers = async () => {
    if (contract) {
      try {
        const usersContract = await (contract as any).getAllUsers();
        console.log("Users in wallet:", usersContract);
        if (usersContract) {
          setUsers((existingUsers) => {
            if (Array.isArray(usersContract)) {
              const newWallets = usersContract.filter(wallet => !existingUsers.includes(wallet));
              return [...existingUsers, ...newWallets];
            } else if (!existingUsers.includes(usersContract)) {
              return [...existingUsers, usersContract];
            }
            return existingUsers;
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    setUsersInitialized(true);
  };

  const handleRedirectToUserPage = () => {
    window.location.href = '/users';
  };

  // Check if the user address is a valid Ethereum address
  const handleCheckEthereumAddress = (userAddress: string) => {
    return ethers.utils.isAddress(userAddress);
  }
  
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/set-cards/${setId}`);
        setCards(response.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
      setLoading(false);
    };
    fetchCards();

    if (contract && !usersInitialized) {
      initUsers();
    }
  }, [setId, contract, usersInitialized]);

  const handleSelectCard = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(cardId) ? newSet.delete(cardId) : newSet.add(cardId);
      return newSet;
    });
  };

  const mintSelectedCards = async () => {
    if (!contract || selectedCards.size === 0) return alert("Wallet not connected or no cards selected.");

    const minted = [];
    let count = 0;
    for (const cardId of selectedCards) {
      try {
        const gasEstimate = await contract.estimateGas.mintNFTCard(userAddress, setId, cardId);
        const gasLimit = gasEstimate.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100));

        const tx = await contract.mintNFTCard(userAddress, setId, cardId, { gasLimit });
        await tx.wait();
        console.log(`Minting successful for card: ${cardId}`);
        const card = cards.find(card => card.id === cardId);
        if (card){
          minted.push(card);
          count++;
        }
      } catch (error) {
        console.error("Minting failed for card:", cardId, error);
      }

    }
    if(count === selectedCards.size){ 
      setMintedCards(minted);
      setShowMintedModal(true);
      setSelectedCards(new Set()); // Reset selected cards
    }
    else{
      return alert("Minting failed for all selected cards.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">Assign to User</h3>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <input
            type="text"
            value={userAddress}
            placeholder="Enter Wallet Address"
            onChange={(e) => setUserAddress(e.target.value)}
            className="form-control me-2"
            style={{ maxWidth: '300px' }}
          />
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {userAddress || "Select a User"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {users.map((user, index) => (
                <Dropdown.Item key={index} onClick={() => setUserAddress(user)}>
                  {user}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
         <div
            className="fixed-top  d-flex justify-content-end" // Make the button fixed at the top
            style={{
                top: '90px',
                right: '30px',
                zIndex: 1030,
                padding: '10px', 
            }}
        >
            <button
                onClick={mintSelectedCards}
                className="btn btn-success"
                disabled={!handleCheckEthereumAddress(userAddress) || selectedCards.size === 0}
                style={{ cursor: userAddress  ? 'pointer' : 'not-allowed' }}
            >
                Mint Selected Cards
            </button>
        </div>
      </div>

      <h2 className="text-center">
        {cards.length > 0 ? `Cards in ${cards[0].set.name}` : "Loading Cards..."}
      </h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className="row">
          {cards.map((card) => (
            <div className="col-6 col-md-2 text-center mb-3" key={card.id}>
              <Card className="border-0">
                <Card.Img variant="top" src={card.images.small} alt={card.name} />
                <Card.Body>
                  <Card.Title>{card.name}</Card.Title>
                  <button
                    className={`btn ${selectedCards.has(card.id) ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => handleSelectCard(card.id)}
                    disabled={!handleCheckEthereumAddress(userAddress)} 
                    style={{ cursor: userAddress ? 'pointer' : 'not-allowed' }}
                  >
                    {selectedCards.has(card.id) ? 'Unselect' : 'Select'}
                  </button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Modal show={showMintedModal} onHide={() => setShowMintedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mint Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel
          wrap={false} // Prevents wrapping back to the first item
          prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon" style={{ filter: 'invert(30%)' }} />}
          nextIcon={<span aria-hidden="true" className="carousel-control-next-icon" style={{ filter: 'invert(30%)' }} />}>

            {mintedCards.map((card, index) => (
              <Carousel.Item key={index} interval={900}>
                <img className="d-block w-100" src={card.images.small} alt={card.name}  style={{ maxHeight: '300px', objectFit: 'contain'}}/>
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMintedModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleRedirectToUserPage}>
              Go to My Cards
            </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cards;






