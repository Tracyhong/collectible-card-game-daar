// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721URIStorage, Ownable {
    string public collectionName;
    uint public cardCount; // Number of cards in the collection
    // uint private _tokenIDcounter; // Token counter for minting

    constructor(string memory _name, uint _cardCount) ERC721(_name, "PKMNFT") Ownable(msg.sender) {
        collectionName = _name;
        cardCount = _cardCount;
        // _tokenIDcounter = 0;
    }

    // Mint a new NFT
    function mintNFT(address _toUser, string memory _apiIDcard, uint _tokenIDcounter) external {  //returns (uint) 
        require(_tokenIDcounter < cardCount, "All cards have been minted");

        // Increment token ID counter before minting
        // _tokenIDcounter++;
        _mint(_toUser, _tokenIDcounter);
        _setTokenURI(_tokenIDcounter, _apiIDcard); // Set the URI for the token
        
        // return _tokenIDcounter;
    }
    function getOwnerOfToken(uint _tokenId) external view returns (address) {
        return ownerOf(_tokenId);
    }
}

// pragma solidity ^0.8;

// import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// contract Collection is ERC721URIStorage, Ownable {

//   string public collectionName;
//   uint public cardCount; // up to 2^16 - 1 = 65535 cards
//   uint private _tokenIDcounter;

//   mapping(uint => address) public tokenURIs; //token nft id to owner address
// 	//
//   constructor(string memory _name, uint _cardCount ) ERC721(_name, "PKMNFT") Ownable(msg.sender) {
//     collectionName = _name;
//     cardCount = uint16(_cardCount);
//         cardCount = _cardCount;


//     _tokenIDcounter = 0;
//   }

//   function mintNFT( address _toUser, string memory _apiIDcard ) external onlyOwner returns (uint) {
//     // mint a new NFT
//     _tokenIDcounter++;
//     _mint(_toUser, _tokenIDcounter);
//     _setTokenURI(_tokenIDcounter, _apiIDcard);   //pour stocker l'id de la carte associé au nft
//     tokenURIs[_tokenIDcounter] = _toUser; // tokenURI(uint256 tokenId) pour get l'uri a partir de l'id

//     return _tokenIDcounter;
//   }
// }
// // function mintNFT(address _toUser, string memory _tokenURI) external onlyOwner returns (uint) {
// //     require(_tokenIDcounter < cardCount, "All cards have been minted");

// //     _mint(_toUser, _tokenIDcounter);
// //     _setTokenURI(_tokenIDcounter, _tokenURI);
// //     tokenURIs[_tokenIDcounter] = _tokenURI;
// //     _tokenIDcounter++;

// //     return _tokenIDcounter - 1; // Return the token ID minted
// // }

// // function getNFTsOfOwner(address _owner) external view returns (uint[] memory) {
// //     uint tokenCount = balanceOf(_owner);
// //     uint[] memory tokenIDs = new uint[](tokenCount);

// //     for (uint i = 0; i < tokenCount; i++) {
// //         tokenIDs[i] = ;
// //     }

// //     return tokenIDs;
// // }
