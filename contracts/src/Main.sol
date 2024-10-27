// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "./Booster.sol";
import "hardhat/console.sol";

contract Main is Ownable {
    uint private count; // number of created collections
    uint private boosterCount; // number of redeemable boosters
    uint private boosterCardCount = 5; // Number of cards in a booster pack

    mapping(uint => Collection) private collections; // collection ID (number) -> collection
    mapping(string => uint) private collectionNameToId; // collection name (apiID) -> collection ID (number)
    mapping(uint => string) private tokenIDToCollectionApiID;  // token ID card -> collection ID (API ID)
    
    mapping(address => uint[]) private userTokens;    // user address -> list of token IDs
    address[] public users;  // list of users

    uint private trackTokenIDCard ; // counter to create token IDs for the cards
    uint private trackTokenIDBooster; // counter to create token IDs for the boosters

    mapping(uint => Booster) private boosters; // booster ID (number) -> booster
    mapping(string => uint) private boosterNameToId; // booster name -> booster ID (number)
    
    mapping(uint => string) private tokenIDToBoosterName;  // token ID -> collection ID (API ID)
    mapping(address => uint[]) private userBoosterToken; // user address -> list of redeemed booster token IDs
    

    // events --------------------------------------
    event CollectionCreated(address indexed owner, string collectionName, uint cardCount);
    event NFTMinted(address indexed owner, uint tokenID, string tokenURI);
    event BoosterCreated(address indexed owner, string boosterName, string collectionName);
    event BoosterOpened(address indexed owner, string boosterName, uint boosterTokenID);
    event BoosterMinted(address indexed owner, uint tokenID, string tokenURI);


    constructor() Ownable(msg.sender) {
        count = 0;
        boosterCount = 0;
        trackTokenIDCard = 0;
        trackTokenIDBooster = 0;
    }

//--------------------------------------Create----------------------------------------------
    // Create a new collection
    function createCollection(string calldata _apiIDCollection, uint cardCount) external {
        require(cardCount > 0, "Card count must be greater than zero");
        
        collections[count] = new Collection(_apiIDCollection, cardCount);
        collectionNameToId[_apiIDCollection] = count;

        emit CollectionCreated(msg.sender, _apiIDCollection, cardCount);
        count++;
    }

    // Create a new booster
    function createBooster(string memory _boosterName, string memory _collectionName) external {
        boosters[boosterCount] = new Booster(_boosterName, _collectionName);
        boosterNameToId[_boosterName] = boosterCount;
        emit BoosterCreated(msg.sender, _boosterName, _collectionName);
        boosterCount++;
    }

//--------------------------------------Functions----------------------------------------------
    // Mint an NFT and associate it with a specific user
    function mintNFTCard(address _toUser, string calldata _apiIDCollection, string calldata _apiIDcard) external {
        uint collectionId = collectionNameToId[_apiIDCollection]; // get the collection id from the collection name
        Collection collection = collections[collectionId]; // get the collection object
        require(address(collection) != address(0), "Collection not found"); // Ensure collection exists
        
        collection.mintNFT(_toUser, _apiIDcard, trackTokenIDCard);

        tokenIDToCollectionApiID[trackTokenIDCard] = _apiIDCollection; // associate the token ID card with the collection ID (API ID)

        userTokens[_toUser].push(trackTokenIDCard); // add the token ID to the user's list of tokens

        //add user to the list of users if not already in it
        if(userTokens[_toUser].length <= 1){
            users.push(_toUser);
        }
        

        emit NFTMinted(_toUser, trackTokenIDCard, _apiIDcard);
        trackTokenIDCard++;
    }

    // Get all collections created (for frontend display)
    function getAllCollectionNames() external view returns(string[] memory) {
        string[] memory names = new string[](count);
        for (uint i = 0; i < count; i++) {
            names[i] = collections[i].collectionName();
        }
        return names;
    }

    function getAllUsers() external view returns(address[] memory) {
        return users;
    }

    // Get all tokens owned by a user
    function getUserTokens(address _user) internal view returns (uint[] memory) {
        return userTokens[_user];
    }

    // Get the card (token URI) from a token ID
    function getCard(uint _tokenId) internal view returns(string memory) {
        string memory collectionApiId = tokenIDToCollectionApiID[_tokenId];
        uint idCollection = collectionNameToId[collectionApiId];
        Collection collection = collections[idCollection];
        return collection.tokenURI(_tokenId);
    }

    // Get all cards (token URIs) owned by a user
    function getUserCards(address _user) external view returns (string[] memory) {
        string[] memory cards = new string[](getUserTokens(_user).length);
        for(uint i = 0; i < getUserTokens(_user).length; i++) {
            cards[i] = getCard(getUserTokens(_user)[i]);
        }
        return cards;
    }

//--------------------------------------Booster----------------------------------------------

    // Get all boosters (for frontend display)
    function getAllBoosterNames() external view returns(string[] memory) {
        string[] memory names = new string[](boosterCount);
        for (uint i = 0; i < boosterCount; i++) {
            names[i] = boosters[i].boosterName();
        }
        return names;
    }

    // Mint a booster NFT for a user
    function mintBooster(address _toUser, string memory _boosterName) external {
        uint boosterId = boosterNameToId[_boosterName];
        Booster booster = boosters[boosterId];
        require(redeemable(_toUser,_boosterName), "Booster already redeemed by user");

        booster.mintBooster(_toUser, trackTokenIDBooster, _boosterName);
        tokenIDToBoosterName[trackTokenIDBooster] = _boosterName;
        userBoosterToken[_toUser].push(trackTokenIDBooster);

        emit BoosterMinted(_toUser, trackTokenIDBooster, _boosterName);
        trackTokenIDBooster++;
    }


    // Check if a user has already redeemed a booster
    function redeemable(address _user, string memory _boosterName) internal view returns (bool) {
        for (uint i = 0; i < userBoosterToken[_user].length; i++) {
            uint tokenId = userBoosterToken[_user][i];
            if(keccak256(abi.encodePacked(tokenIDToBoosterName[tokenId])) == keccak256(abi.encodePacked(_boosterName))){
                return false;
            }
        }
        return true;
    }

    // Check for a list of boosters if they are redeemable by a user
    function isRedeemable(address _user, string[] memory _boostersName) external view returns (bool[] memory) {
        
        bool[] memory redeemableBoosters = new bool[](_boostersName.length);
        if(userBoosterToken[_user].length == 0 || users.length == 0){
            for (uint i = 0; i < _boostersName.length; i++) {
                redeemableBoosters[i] = true;
            }
        }
        else{
            for (uint i = 0; i < _boostersName.length; i++) {
                redeemableBoosters[i] = redeemable(_user, _boostersName[i]);
            }
        }
        return redeemableBoosters;
    }


    fallback() external payable {
        console.log("----- fallback:", msg.value);
    }

    receive() external payable {
        console.log("----- receive:", msg.value);
    }

}