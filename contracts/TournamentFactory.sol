// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SnakeTournament.sol";

contract TournamentFactory {
    event TournamentCreated(
        uint256 indexed tournamentId,
        address indexed creator,
        address tournamentAddress,
        string tournamentType,
        uint256 entryFee,
        uint256 prizePool
    );

    uint256 public tournamentCounter;
    mapping(uint256 => address) public tournaments;
    
    // Tournament parameters
    uint256 public constant MIN_DURATION = 2 minutes;
    uint256 public constant MAX_DURATION = 3 minutes;
    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    
    function createTournament(
        string memory _name,
        string memory _tournamentType,
        uint256 _duration,
        uint256 _entryFee,
        uint256 _targetScore
    ) external payable returns (address) {
        require(
            _duration >= MIN_DURATION && _duration <= MAX_DURATION,
            "Invalid duration"
        );
        require(_entryFee >= MIN_ENTRY_FEE, "Entry fee too low");
        require(msg.value >= _entryFee, "Insufficient entry fee");
        
        tournamentCounter++;
        
        // Deploy new tournament contract
        SnakeTournament tournament = new SnakeTournament{
            value: msg.value
        }(
            tournamentCounter,
            _name,
            _tournamentType,
            _duration,
            _entryFee,
            _targetScore,
            msg.sender
        );
        
        tournaments[tournamentCounter] = address(tournament);
        
        emit TournamentCreated(
            tournamentCounter,
            msg.sender,
            address(tournament),
            _tournamentType,
            _entryFee,
            msg.value
        );
        
        return address(tournament);
    }
    
    function getTournament(uint256 _tournamentId) external view returns (address) {
        return tournaments[_tournamentId];
    }
}
