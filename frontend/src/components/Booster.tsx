import React, { useEffect, useState } from 'react';
import { Card, Modal, Carousel, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ethers } from 'ethers';
import useWallet from '@/wallet/useWallet'; 

interface PokemonBooster {
  boosterName: string;
  image: string;
}

interface CardData {
  id: string;
  name: string;
  images: {
    small: string;
  };
}

const Booster: React.FC = () => {
  const { details, contract, walletError } = useWallet();
  const [pokemonBoostersInitialized, setPokemonBoostersInitialized] = useState(false);
  const [pokemonBoosters, setPokemonBoosters] = useState<PokemonBooster[]>([]);
  const [redeemable, setRedeemable] = useState<boolean[]>([]);
  const [user, setUser] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [currentBoosterCards, setCurrentBoosterCards] = useState<CardData[]>([]);
  const [boostersNames, setBoostersNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to initialize and fetch boosters
  const initBoosters = async (user : string) => {
    try {
      console.log('Init collections for Pokémon boosters...');
      console.log('the user is :', user);
      const boosters = await (contract as any).getAllBoosterNames();
      if (boosters) {
        console.log('Boosters:', boosters);
        setBoostersNames(boosters);
        const url = `http://localhost:3000/init-pokemon-boosters?boosters=${boosters}`;
        const response = await axios.get(url);
        if (response.data) {
          setPokemonBoosters(response.data);
          setPokemonBoostersInitialized(true);
        }
        await isRedeemable(user,boosters);
      }
    } catch (error) {
      console.error('Error initializing Pokémon boosters:', error);
    }
  };
  
  const redeemBooster = async (boosterName: string) => {
    try {
      console.log('Redeeming booster:', boosterName);
      if (!contract) return alert("Wallet not connected.");
      console.log("Booster:", boosterName, "to user:", user);
  
      // Estimate gas for mintBooster function
      let gasEstimate = ethers.BigNumber.from(50000);
      try {
        gasEstimate = await contract.estimateGas.mintBooster(user, boosterName);
      } catch (error) {
        console.error("Gas estimation failed:", error);
        alert("Failed to estimate gas. Please check your inputs or wallet.");
      }
  
      // Increase gas limit by 20% to avoid out-of-gas exceptions
      const gasLimit = gasEstimate.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100));
      try {
        const tx = await (contract as any).mintBooster(user, boosterName, { gasLimit });
        const receipt = await tx.wait();
        console.log(`Minting successful: ${receipt.transactionHash}`);
        const BoosterMintedEvent = receipt.events?.find((event: any) => event.event === 'BoosterMinted');
        if (BoosterMintedEvent) {
          console.log('NFTMinted event args:', BoosterMintedEvent.args);
          return true;
        }
      } catch (error) {
        console.error("Minting failed:", error);
        alert("Minting failed. Please check your wallet or contract interaction.");
      }
    } catch (error) {
      console.error('Error redeeming booster:', error);
    }
    return false
  };

  const openBooster = async (boosterName: string) => {
    setLoading(true); // Set loading to true before fetching cards
    try {
      console.log('Opening booster:', boosterName);
      let apiIDCards = [];
      const url = `http://localhost:3000/get-booster-cards/${boosterName}`;
      const res = await axios.get(url);
      if (res.data) {
        apiIDCards = res.data;
        console.log('Booster cards:', apiIDCards);      
        console.log('Opening booster:', boosterName + ' for user:', user);
        const responseGetSetId = await axios.get(`http://localhost:3000/get-setId-booster/${boosterName}`);
        let setId = '';
        if (responseGetSetId.data) {
            setId = responseGetSetId.data;
        }
        for(let i = 0; i < apiIDCards.length; i++) {
          const card = apiIDCards[i];
              await mintCard(user, card.id, setId);
        }
        setCurrentBoosterCards(apiIDCards); 
        setShowModal(true); 
      }

    } catch (error) {
      console.error('Error opening booster:', error);
    }
    
    await isRedeemable(user,boostersNames);
    setLoading(false); 
  };

  const mintCard = async (userAddress: string, cardId: string, setId:string) => {
    if (!contract) return alert("Wallet not connected.");
    console.log("Minting card:", cardId, "to user:", userAddress, "in collection:", setId);

    let gasEstimate = ethers.BigNumber.from(50000);
    try {
      gasEstimate = await contract.estimateGas.mintNFTCard(userAddress, setId, cardId);
    } catch (error) {
      console.error("Gas estimation failed:", error);
      alert("Failed to estimate gas. Please check your inputs or wallet.");
    }

    // Increase gas limit by 20% to avoid out-of-gas exceptions
    const gasLimit = gasEstimate.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100));
    try {
      const tx = await contract.mintNFTCard(userAddress, setId, cardId, { gasLimit });
      const receipt = await tx.wait();
      console.log(`Minting successful: ${receipt.transactionHash}`);
      const NFTMintedEvent = receipt.events?.find((event: any) => event.event === 'NFTMinted');
      if (NFTMintedEvent) {
        console.log('NFTMinted event args:', NFTMintedEvent.args);
      }
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please check your wallet or contract interaction.");
    }
  };

  const isRedeemable = async (user:string, booster:string[]) => {
    try {
      if (!contract) return alert("Wallet not connected.");
      console.log('Checking redeemable boosters for user:', user);
      console.log('Boosters to check:', booster);
      const result = await (contract as any).isRedeemable(user, booster);
      console.log('Is redeemable:', result);
      if(result) {
        setRedeemable(result);
      }
    } catch (error) {
      console.error('Error checking redeemable:', error);
    }
    return false;
  }

  const handleBoosterClick = async (boosterName: string, isRedeemable: boolean) => {
    if (!isRedeemable) {
      console.log("This booster is not redeemable.");
      return; // Prevent further actions if not redeemable
    }
    
    const result = await redeemBooster(boosterName);
    if (result) {
      await openBooster(boosterName);
    } else {
      console.log("Failed to redeem booster");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentBoosterCards([]); // Clear the cards when modal is closed
  };

  const handleRedirectToUserPage = () => {
    window.location.href = '/users'; 
  };

  useEffect(() => {
    if (details && contract && !pokemonBoostersInitialized) {
      const user = details.account;
      if (user) {
        setUser(user);
        
        initBoosters(user);
      }
    }
    if(pokemonBoostersInitialized && user && boostersNames.length > 0) {
       
      setUser(user);
      isRedeemable(user,boostersNames);
    }

  }, [details, contract, user, pokemonBoostersInitialized,boostersNames]);

  return (
    
    <div className="container mt-4">
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    <h2 className="text-center mb-4">Pokémon Boosters</h2>
    <h4 className="text-center mb-3" style={{ fontSize: '1.5rem', color: '#555' }}>
      Click on a booster to redeem it!
    </h4>
    {user ? (
      <h4 className="text-center mb-3" style={{ fontSize: '1.2rem', color: '#555' }}>
        Connected as: <strong>{user}</strong>
      </h4>
      ) : (
        <h4 className="mb-3" style={{ fontSize: '1.2rem', color: '#555' }}>Connecting you...</h4>
      )}
      <div className="row justify-content-center">
        {pokemonBoosters.map((booster, index) => (
          <div
            className="col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-4"
            key={booster.boosterName}
            style={{ cursor: redeemable[index] ? 'pointer' : 'not-allowed' }} 
            onClick={() => handleBoosterClick(booster.boosterName, redeemable[index])}
          >
            <Card
              style={{
                width: '18rem',
                height: '340px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                filter: redeemable[index] ? 'none' : 'grayscale(100%)', // Apply grayscale filter if not redeemable
              }}
              className={`hover-card ${!redeemable[index] ? 'disabled-card' : ''}`} 
            >
              <Card.Img variant="top" src={booster.image} />
              <Card.Body className="text-center">
                <Card.Title>{booster.boosterName}</Card.Title>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Booster Cards</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel
    prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon" style={{ filter: 'invert(30%)' }} />}
    nextIcon={<span aria-hidden="true" className="carousel-control-next-icon" style={{ filter: 'invert(30%)' }} />}>
            {currentBoosterCards.map((card, index) => (
              <Carousel.Item key={index}>
                <img className="d-block w-100" src={card.images.small} alt={card.name}  style={{ maxHeight: '400px', objectFit: 'contain' }}/>
                <Carousel.Caption>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleRedirectToUserPage}>
            Go to My Cards
          </Button>
        </Modal.Footer>
      </Modal>
       {/* Custom styles for hover effect */}
       <style>{`
         .hover-card:hover {
           transform: scale(1.05);
           box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
         }
           .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000; /* Ensure spinner is on top */
          }

          body.loading {
            overflow: hidden; /* Prevent scrolling when loading */
            filter: blur(5px); /* Apply blur effect */
          }

       `}</style>
    </div>
  );
};

export default Booster;
