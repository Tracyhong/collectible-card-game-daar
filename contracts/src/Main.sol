
// pragma solidity ^0.8.20;

// import "./Collection.sol";
// import "./Booster.sol";
// import "hardhat/console.sol";

// contract Main is Ownable {
//     // address public superOwner;
//     uint private count; 
//     uint private boosterCount;
//     uint private boosterCardCount = 10; // Number of cards in a booster pack
//     mapping(uint => Collection) private collections; // collection ID (number) -> collection
//     mapping(string => uint) private collectionNameToId; // collection name (apiID) to collection ID (number)
//     mapping(uint => string) private tokenIDToCollectionApiID;  // token ID -> collection ID (API ID)
//     mapping(address => uint[]) private userTokens;    // user address to list of token IDs
//     uint private trackTokenIDCard ;
    
//     address[] public users;  // list of users
//     // mapping(address => bool) private userExist;

//     uint private trackTokenIDBooster;
//     mapping(uint => Booster) private boosters; // booster ID to booster
//     mapping(string => uint) private boosterNameToId; // booster name to booster ID
//     // mapping of users who already redeemed a collection's booster
//     // mapping(string => address[]) public collectionNameToAlreadyRedeemedUsers;
    
//     mapping(uint => string) private tokenIDToBoosterName;  // token ID -> collection ID (API ID)
//     mapping(address => uint[]) private userBoosterToken; // user address to list of redeemed booster token IDs
    

//     event CollectionCreated(address indexed owner, string collectionName, uint cardCount);
//     event NFTMinted(address indexed owner, uint tokenID, string tokenURI);
//     event BoosterCreated(address indexed owner, string boosterName, string collectionName);
//     event BoosterOpened(address indexed owner, string boosterName, uint boosterTokenID);
//     event BoosterMinted(address indexed owner, uint tokenID, string tokenURI);

//     constructor() Ownable(msg.sender) {
//         count = 0;
//         boosterCount = 0; // number of boosters redeemable
//         trackTokenIDCard = 0;
//         trackTokenIDBooster = 0; // token IDs for boosters to users
//     }
// //--------------------------------------Create----------------------------------------------
//     // Create a new collection
//     function createCollection(string calldata _apiIDCollection, uint cardCount) external {
//         require(cardCount > 0, "Card count must be greater than zero");
        
//         collections[count] = new Collection(_apiIDCollection, cardCount);
//         collectionNameToId[_apiIDCollection] = count;

//         emit CollectionCreated(msg.sender, _apiIDCollection, cardCount);
//         count++;
//     }

//     // Create a new booster
//     function createBooster(string memory _boosterName, string memory _collectionName) external {
//         boosters[boosterCount] = new Booster(_boosterName, _collectionName);
//         boosterNameToId[_boosterName] = boosterCount;
//         emit BoosterCreated(msg.sender, _boosterName, _collectionName);
//         boosterCount++;
//     }

// //--------------------------------------Functions----------------------------------------------
//     // Mint an NFT and associate it with a specific user
//     function mintNFTCard(address _toUser, string calldata _apiIDCollection, string calldata _apiIDcard) external {
//         // Check if the sender is the super owner
//         // require(msg.sender == owner(), "Only the super owner can mint cards");
//         uint collectionId = collectionNameToId[_apiIDCollection]; // get the collection id from the collection name
//         Collection collection = collections[collectionId]; // get the collection object
//         require(address(collection) != address(0), "Collection not found"); // Ensure collection exists
        
//         // Mint NFT in the selected collection
//         // uint tokenId = 
//         collection.mintNFT(_toUser, _apiIDcard, trackTokenIDCard);

//         // Map the token ID to the collection's API ID for tracking
//         tokenIDToCollectionApiID[trackTokenIDCard] = _apiIDCollection;

//         // Track user's token ownership
//         userTokens[_toUser].push(trackTokenIDCard);

//         //add user to the list of users if not already in it
//         if(userTokens[_toUser].length <= 1){
//             users.push(_toUser);
//         }
        

//         emit NFTMinted(_toUser, trackTokenIDCard, _apiIDcard);
//         trackTokenIDCard++;
//     }

//     // Get all collections created (for frontend display)
//     function getAllCollectionNames() external view returns(string[] memory) {
//         string[] memory names = new string[](count);
//         for (uint i = 0; i < count; i++) {
//             names[i] = collections[i].collectionName();
//         }
//         return names;
//     }

//     function getAllUsers() external view returns(address[] memory) {
//         return users;
//     }

//     // Get all tokens owned by a user
//     function getUserTokens(address _user) internal view returns (uint[] memory) {
//         return userTokens[_user];
//     }

//     // Get the card (token URI) from a token ID
//     function getCard(uint _tokenId) internal view returns(string memory) {
//         string memory collectionApiId = tokenIDToCollectionApiID[_tokenId];
//         uint idCollection = collectionNameToId[collectionApiId];
//         Collection collection = collections[idCollection];
//         return collection.tokenURI(_tokenId);
//     }

//     // Get all cards (token URIs) owned by a user
//     function getUserCards(address _user) external view returns (string[] memory) {
//         string[] memory cards = new string[](getUserTokens(_user).length);
//         for(uint i = 0; i < getUserTokens(_user).length; i++) {
//             cards[i] = getCard(getUserTokens(_user)[i]);
//         }
//         return cards;
//     }

// //--------------------------------------Booster----------------------------------------------

//     // Get all boosters (for frontend display)
//     function getAllBoosterNames() external view returns(string[] memory) {
//         string[] memory names = new string[](boosterCount);
//         for (uint i = 0; i < boosterCount; i++) {
//             names[i] = boosters[i].boosterName();
//         }
//         return names;
//     }


//     function mintBooster(address _toUser, string memory _boosterName) external {
//         uint boosterId = boosterNameToId[_boosterName];
//         Booster booster = boosters[boosterId];
//         require(redeemable(_toUser,_boosterName), "Booster already redeemed by user");

//         booster.mintBooster(_toUser, trackTokenIDBooster, _boosterName);
//         tokenIDToBoosterName[trackTokenIDBooster] = _boosterName;
//         userBoosterToken[_toUser].push(trackTokenIDBooster);

//         emit BoosterMinted(_toUser, trackTokenIDBooster, _boosterName);
//         trackTokenIDBooster++;
//     }


//     // Check if a user has already redeemed a booster
//     function redeemable(address _user, string memory _boosterName) internal view returns (bool) {
//         for (uint i = 0; i < userBoosterToken[_user].length; i++) {
//             uint tokenId = userBoosterToken[_user][i];
//             if(keccak256(abi.encodePacked(tokenIDToBoosterName[tokenId])) == keccak256(abi.encodePacked(_boosterName))){
//                 return false;
//             }
//         }
//         return true;
//     }

//     function getUserBoosters(address _user) external view returns (string[] memory) {
//         string[] memory userBoosters = new string[](userBoosterToken[_user].length);
//         for(uint i = 0; i < userBoosterToken[_user].length; i++) {
//             userBoosters[i] = tokenIDToBoosterName[userBoosterToken[_user][i]];
//         }
//         return userBoosters;
//     }

//     // open a booster and mint a NFT for each card in the booster
//     function openBooster(address _toUser, string[] calldata _apiIDCardList, string calldata _boosterName) external onlyOwner {
//         // get the booster's collection to mint the cards
//         uint boosterTokenID = boosterNameToId[_boosterName];
//         Booster booster = boosters[boosterTokenID];

//         for (uint i = 0; i < boosterCardCount ; i++) { // mint a NFT for each card in the booster
//             this.mintNFTCard(_toUser, booster.collectionName(), _apiIDCardList[i]);
//             trackTokenIDCard++;
//         }

//         for (uint i = 0; i < userBoosterToken[_toUser].length; i++) {
//             uint tokenId = userBoosterToken[_toUser][i];
//             if(keccak256(abi.encodePacked(tokenIDToBoosterName[tokenId])) == keccak256(abi.encodePacked(_boosterName))){
//                 booster.burn(tokenId); // discard the booster NFT after opening it
//                 break;
//             }
//         }
//         emit BoosterOpened(_toUser, _boosterName, boosterTokenID);
//     }
//     // Check if the user can redeem a booster
//     function is(address _user, string[] memory _boostersName) external view returns (bool[] memory) {
//         bool[] memory redeemableBoosters = new bool[](_boostersName.length);
//         for (uint i = 0; i < _boostersName.length; i++) {
//             redeemableBoosters[i] = redeemable(_user, _boostersName[i]);
//         }
//         return redeemableBoosters;
//     }

//     fallback() external payable {
//         console.log("----- fallback:", msg.value);
//     }

//     receive() external payable {
//         console.log("----- receive:", msg.value);
//     }

// }
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "./Booster.sol";
import "hardhat/console.sol";

contract Main is Ownable {
    // address public superOwner;
    uint private count; 
    uint private boosterCount;
    uint private boosterCardCount = 5; // Number of cards in a booster pack
    mapping(uint => Collection) private collections; // collection ID (number) -> collection
    mapping(string => uint) private collectionNameToId; // collection name (apiID) to collection ID (number)
    mapping(uint => string) private tokenIDToCollectionApiID;  // token ID -> collection ID (API ID)
    mapping(address => uint[]) private userTokens;    // user address to list of token IDs
    uint private trackTokenIDCard ;
    
    address[] public users;  // list of users
    // mapping(address => bool) private userExist;

    uint private trackTokenIDBooster;
    mapping(uint => Booster) private boosters; // booster ID to booster
    mapping(string => uint) private boosterNameToId; // booster name to booster ID
    // mapping of users who already redeemed a collection's booster
    // mapping(string => address[]) public collectionNameToAlreadyRedeemedUsers;
    
    mapping(uint => string) private tokenIDToBoosterName;  // token ID -> collection ID (API ID)
    mapping(address => uint[]) private userBoosterToken; // user address to list of redeemed booster token IDs
    

    event CollectionCreated(address indexed owner, string collectionName, uint cardCount);
    event NFTMinted(address indexed owner, uint tokenID, string tokenURI);
    event BoosterCreated(address indexed owner, string boosterName, string collectionName);
    event BoosterOpened(address indexed owner, string boosterName, uint boosterTokenID);
    event BoosterMinted(address indexed owner, uint tokenID, string tokenURI);

    constructor() Ownable(msg.sender) {
        count = 0;
        boosterCount = 0; // number of boosters redeemable
        trackTokenIDCard = 0;
        trackTokenIDBooster = 0; // token IDs for boosters to users
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
        // Check if the sender is the super owner
        // require(msg.sender == owner(), "Only the super owner can mint cards");
        uint collectionId = collectionNameToId[_apiIDCollection]; // get the collection id from the collection name
        Collection collection = collections[collectionId]; // get the collection object
        require(address(collection) != address(0), "Collection not found"); // Ensure collection exists
        
        // Mint NFT in the selected collection
        // uint tokenId = 
        collection.mintNFT(_toUser, _apiIDcard, trackTokenIDCard);

        // Map the token ID to the collection's API ID for tracking
        tokenIDToCollectionApiID[trackTokenIDCard] = _apiIDCollection;

        // Track user's token ownership
        userTokens[_toUser].push(trackTokenIDCard);

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

    function getUserBoosters(address _user) external view returns (string[] memory) {
        string[] memory userBoosters = new string[](userBoosterToken[_user].length);
        for(uint i = 0; i < userBoosterToken[_user].length; i++) {
            userBoosters[i] = tokenIDToBoosterName[userBoosterToken[_user][i]];
        }
        return userBoosters;
    }

    // open a booster and mint a NFT for each card in the booster
    function openBooster(address _toUser, string[] calldata _apiIDCardList, string calldata _boosterName) external onlyOwner {
        // get the booster's collection to mint the cards
        uint boosterTokenID = boosterNameToId[_boosterName];
        Booster booster = boosters[boosterTokenID];

        for (uint i = 0; i < boosterCardCount ; i++) { // mint a NFT for each card in the booster
            this.mintNFTCard(_toUser, booster.collectionName(), _apiIDCardList[i]);
            trackTokenIDCard++;
        }

        for (uint i = 0; i < userBoosterToken[_toUser].length; i++) {
            uint tokenId = userBoosterToken[_toUser][i];
            if(keccak256(abi.encodePacked(tokenIDToBoosterName[tokenId])) == keccak256(abi.encodePacked(_boosterName))){
                booster.burn(tokenId); // discard the booster NFT after opening it
                break;
            }
        }
        emit BoosterOpened(_toUser, _boosterName, boosterTokenID);
    }
    // Check if the user can redeem a booster
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