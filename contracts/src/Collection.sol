// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract Collection is ERC721URIStorage, Ownable {
    string public collectionName;
    uint public cardCount; // Number of cards in the collection

    constructor(string memory _name, uint _cardCount) ERC721(_name, "PKMNFT") Ownable(msg.sender) {
        collectionName = _name;
        cardCount = _cardCount;
    }

    // Mint a new NFT card to a user
    function mintNFT(address _toUser, string memory _apiIDcard, uint _tokenIDcounter) external { 
        require(_tokenIDcounter < cardCount, "All cards have been minted");

        _mint(_toUser, _tokenIDcounter);
        _setTokenURI(_tokenIDcounter, _apiIDcard);
        
    }

}
