// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Collection} from "./Collection.sol";
import "hardhat/console.sol";


contract Booster is ERC721URIStorage, ERC721Burnable, Ownable {

    string public boosterName;
    string public collectionName; // Name of the collection the booster belongs to
    

    constructor(string memory _boosterName, string memory _collectionName) ERC721(_boosterName, "PKMNFTBOOSTER") Ownable(msg.sender) {
        boosterName = _boosterName;
        collectionName = _collectionName;
    }

    // mint a booster to the user _toUser
    function mintBooster(address _toUser, uint _tokenIDbooster, string memory _tokenURIbooster) external onlyOwner {
        _mint(_toUser, _tokenIDbooster);
        _setTokenURI(_tokenIDbooster, _tokenURIbooster);
    }



    // overriding functions
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    fallback() external payable {
        console.log("----- fallback:", msg.value);
    }

    receive() external payable {
        console.log("----- receive:", msg.value);
    }

}