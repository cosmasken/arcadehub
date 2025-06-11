// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INFTContract is IERC721 {
    function mint(address to, string memory uri) external returns (uint256);
}

contract NFTManager is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    INFTContract public immutable nftContract;
    uint256 public nftMintCost = 100;

    event NFTTransferred(address indexed from, address indexed to, uint256 tokenId);
    event NFTMinted(address indexed player);

    constructor(address _arcToken, address _nftContract, address _initialOwner) Ownable(_initialOwner) {
        require(_arcToken != address(0), "Invalid token address");
        require(_nftContract != address(0), "Invalid NFT contract address");
        arcToken = IERC20(_arcToken);
        nftContract = INFTContract(_nftContract);
    }

    function setNFTMintCost(uint256 _newCost) external onlyOwner {
        require(_newCost > 0, "Cost must be greater than zero");
        nftMintCost = _newCost;
    }

    function transferNFT(address to, uint256 tokenId) external nonReentrant {
        require(to != address(0), "Invalid recipient");
        nftContract.transferFrom(msg.sender, to, tokenId);
        emit NFTTransferred(msg.sender, to, tokenId);
    }

    function mintNFT(string memory uri) external nonReentrant {
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(arcToken.transferFrom(msg.sender, address(this), nftMintCost), "Payment failed");
        nftContract.mint(msg.sender, uri);
        emit NFTMinted(msg.sender);
    }
}