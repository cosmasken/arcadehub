// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnakeTournament {
    enum TournamentStatus { Open, InProgress, Completed, Cancelled }
    enum TournamentType { TimeAttack, Survival, TargetScore, Endless }
    
    struct Player {
        address playerAddress;
        uint256 score;
        bool isRegistered;
        bool hasSubmittedScore;
    }
    
    struct Tournament {
        uint256 id;
        string name;
        TournamentType tournamentType;
        uint256 startTime;
        uint256 endTime;
        uint256 duration;
        uint256 entryFee;
        uint256 prizePool;
        uint256 targetScore;
        address creator;
        TournamentStatus status;
        address[] players;
        address[] winners;
        mapping(address => Player) playerInfo;
    }
    
    Tournament public tournament;
    
    event PlayerRegistered(address indexed player, uint256 tournamentId);
    event ScoreSubmitted(address indexed player, uint256 score);
    event TournamentStarted(uint256 startTime, uint256 endTime);
    event TournamentEnded(address[] winners, uint256[] prizes);
    event PrizeDistributed(address winner, uint256 amount);
    
    modifier onlyCreator() {
        require(msg.sender == tournament.creator, "Only creator can call this");
        _;
    }
    
    modifier onlyRegistered() {
        require(tournament.playerInfo[msg.sender].isRegistered, "Not registered");
        _;
    }
    
    modifier onlyDuringRegistration() {
        require(tournament.status == TournamentStatus.Open, "Not in registration");
        _;
    }
    
    modifier onlyDuringTournament() {
        require(
            tournament.status == TournamentStatus.InProgress &&
            block.timestamp >= tournament.startTime &&
            block.timestamp <= tournament.endTime,
            "Tournament not active"
        );
        _;
    }
    
    constructor(
        uint256 _id,
        string memory _name,
        string memory _tournamentType,
        uint256 _duration,
        uint256 _entryFee,
        uint256 _targetScore,
        address _creator
    ) payable {
        require(bytes(_name).length > 0, "Name required");
        require(_duration > 0, "Duration must be positive");
        
        tournament.id = _id;
        tournament.name = _name;
        tournament.tournamentType = parseTournamentType(_tournamentType);
        tournament.duration = _duration;
        tournament.entryFee = _entryFee;
        tournament.prizePool = msg.value;
        tournament.targetScore = _targetScore;
        tournament.creator = _creator;
        tournament.status = TournamentStatus.Open;
    }
    
    function register() external payable onlyDuringRegistration {
        require(msg.value >= tournament.entryFee, "Insufficient entry fee");
        require(!tournament.playerInfo[msg.sender].isRegistered, "Already registered");
        
        // Add player to tournament
        tournament.players.push(msg.sender);
        tournament.playerInfo[msg.sender] = Player({
            playerAddress: msg.sender,
            score: 0,
            isRegistered: true,
            hasSubmittedScore: false
        });
        
        // Add entry fee to prize pool
        if (msg.value > tournament.entryFee) {
            // Refund excess ETH
            payable(msg.sender).transfer(msg.value - tournament.entryFee);
        }
        
        emit PlayerRegistered(msg.sender, tournament.id);
    }
    
    function startTournament() external onlyCreator onlyDuringRegistration {
        require(tournament.players.length >= 2, "Not enough players");
        
        tournament.status = TournamentStatus.InProgress;
        tournament.startTime = block.timestamp;
        tournament.endTime = block.timestamp + tournament.duration;
        
        emit TournamentStarted(tournament.startTime, tournament.endTime);
    }
    
    function submitScore(uint256 _score) external onlyRegistered onlyDuringTournament {
        Player storage player = tournament.playerInfo[msg.sender];
        require(!player.hasSubmittedScore, "Score already submitted");
        
        player.score = _score;
        player.hasSubmittedScore = true;
        
        emit ScoreSubmitted(msg.sender, _score);
        
        // Check for target score completion
        if (tournament.tournamentType == TournamentType.TargetScore && 
            _score >= tournament.targetScore) {
            _endTournament();
        }
    }
    
    function endTournament() external {
        require(
            msg.sender == tournament.creator || 
            block.timestamp > tournament.endTime,
            "Not authorized or too early"
        );
        require(tournament.status == TournamentStatus.InProgress, "Tournament not in progress");
        
        _endTournament();
    }
    
    function _endTournament() internal {
        tournament.status = TournamentStatus.Completed;
        
        // Determine winners based on tournament type
        if (tournament.players.length > 0) {
            if (tournament.tournamentType == TournamentType.TimeAttack ||
                tournament.tournamentType == TournamentType.TargetScore) {
                // Sort players by score (descending)
                _sortPlayersByScore();
                tournament.winners = new address[](1);
                tournament.winners[0] = tournament.players[0];
            } else if (tournament.tournamentType == TournamentType.Survival) {
                // In survival mode, all players who submitted scores are winners
                // but we might want to implement specific logic here
                tournament.winners = new address[](tournament.players.length);
                for (uint i = 0; i < tournament.players.length; i++) {
                    if (tournament.playerInfo[tournament.players[i]].hasSubmittedScore) {
                        tournament.winners[i] = tournament.players[i];
                    }
                }
            }
            
            // Distribute prizes
            _distributePrizes();
        }
        
        emit TournamentEnded(tournament.winners, _calculatePrizes());
    }
    
    function _sortPlayersByScore() internal {
        // Simple bubble sort for demonstration
        uint n = tournament.players.length;
        for (uint i = 0; i < n - 1; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (tournament.playerInfo[tournament.players[j]].score < 
                    tournament.playerInfo[tournament.players[j + 1]].score) {
                    // Swap
                    address temp = tournament.players[j];
                    tournament.players[j] = tournament.players[j + 1];
                    tournament.players[j + 1] = temp;
                }
            }
        }
    }
    
    function _distributePrizes() internal {
        if (tournament.winners.length == 0 || tournament.prizePool == 0) return;
        
        uint256[] memory prizes = _calculatePrizes();
        
        for (uint i = 0; i < tournament.winners.length; i++) {
            if (tournament.winners[i] != address(0) && prizes[i] > 0) {
                payable(tournament.winners[i]).transfer(prizes[i]);
                emit PrizeDistributed(tournament.winners[i], prizes[i]);
            }
        }
    }
    
    function _calculatePrizes() internal view returns (uint256[] memory) {
        uint256[] memory prizes = new uint256[](tournament.winners.length);
        
        if (tournament.winners.length == 0) return prizes;
        
        // Simple winner-takes-all for now
        if (tournament.winners.length == 1) {
            prizes[0] = tournament.prizePool;
        } else {
            // Split prize pool among winners (50%, 30%, 20% for top 3)
            uint256 remaining = tournament.prizePool;
            
            if (tournament.winners.length >= 1) {
                prizes[0] = (tournament.prizePool * 50) / 100;
                remaining -= prizes[0];
            }
            
            if (tournament.winners.length >= 2) {
                prizes[1] = (tournament.prizePool * 30) / 100;
                remaining -= prizes[1];
            }
            
            if (tournament.winners.length >= 3) {
                prizes[2] = (tournament.prizePool * 20) / 100;
                remaining -= prizes[2];
            }
            
            // If there are more than 3 winners, split the remaining
            if (tournament.winners.length > 3 && remaining > 0) {
                uint256 perWinner = remaining / (tournament.winners.length - 3);
                for (uint i = 3; i < tournament.winners.length; i++) {
                    prizes[i] = perWinner;
                }
            }
        }
        
        return prizes;
    }
    
    function parseTournamentType(string memory _type) internal pure returns (TournamentType) {
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        
        if (typeHash == keccak256(abi.encodePacked("TimeAttack"))) {
            return TournamentType.TimeAttack;
        } else if (typeHash == keccak256(abi.encodePacked("Survival"))) {
            return TournamentType.Survival;
        } else if (typeHash == keccak256(abi.encodePacked("TargetScore"))) {
            return TournamentType.TargetScore;
        } else if (typeHash == keccak256(abi.encodePacked("Endless"))) {
            return TournamentType.Endless;
        } else {
            revert("Invalid tournament type");
        }
    }
    
    // View functions
    function getPlayers() external view returns (address[] memory) {
        return tournament.players;
    }
    
    function getPlayerInfo(address _player) external view returns (uint256 score, bool hasSubmitted) {
        return (
            tournament.playerInfo[_player].score,
            tournament.playerInfo[_player].hasSubmittedScore
        );
    }
    
    function getWinners() external view returns (address[] memory) {
        return tournament.winners;
    }
    
    function getTournamentInfo() external view returns (
        uint256 id,
        string memory name,
        TournamentType tournamentType,
        uint256 startTime,
        uint256 endTime,
        uint256 duration,
        uint256 entryFee,
        uint256 prizePool,
        uint256 targetScore,
        address creator,
        TournamentStatus status,
        uint256 playerCount
    ) {
        return (
            tournament.id,
            tournament.name,
            tournament.tournamentType,
            tournament.startTime,
            tournament.endTime,
            tournament.duration,
            tournament.entryFee,
            tournament.prizePool,
            tournament.targetScore,
            tournament.creator,
            tournament.status,
            tournament.players.length
        );
    }
}
