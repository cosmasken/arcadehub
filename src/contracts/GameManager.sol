pragma solidity ^0.8.20;

contract GameManager {
    struct Game {
        uint256 gameId;
        string name;
        string ipfsHash;
    }
    mapping(uint256 => Game) public games;
    mapping(uint256 => bool) public gameIdExists;

    event GameSubmitted(uint256 indexed gameId, address indexed developer, string name, string ipfsHash);

     function submitGame(uint256 gameId, string calldata name, string calldata ipfsHash) external {
        require(!gameIdExists[gameId], "Game ID already exists");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        gameIdExists[gameId] = true;
        games[gameId] = Game(gameId, name, ipfsHash);
        emit GameSubmitted(gameId, msg.sender, name, ipfsHash);
    }
}