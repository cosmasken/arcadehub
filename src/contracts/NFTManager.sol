pragma solidity ^0.8.20;

interface INFTContract {
    function mint(address to, string memory uri) external returns (uint256);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract NFTManager {
    INFTContract public nftContract;
    uint256 public nftMintCost = 100;

    event NFTTransferred(address indexed from, address indexed to, uint256 tokenId);
    event NFTMinted(address indexed player);

    constructor(address _nftContract) {
        nftContract = INFTContract(_nftContract);
    }

    // Transfer NFT
    function transferNFT(address to, uint256 tokenId) external nonReentrant {
        nftContract.transferFrom(msg.sender, to, tokenId);
        emit NFTTransferred(msg.sender, to, tokenId);
    }

    // Mint NFT
    uint256 public nftMintCost = 100; // Cost in ARC tokens
    function mintNFT(string memory uri) external nonReentrant {
        require(arcToken.transferFrom(msg.sender, address(this), nftMintCost), "Payment failed");
        nftContract.mint(msg.sender, uri);
        emit NFTMinted(msg.sender);
    }

}