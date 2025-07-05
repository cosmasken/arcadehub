// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TournamentHub {
    // Custom errors
    error ZeroPrizePool();
    error NotActive();
    error AlreadyJoined();
    error NotParticipant();
    error TournamentNotFound();
    error NotCreator();

    // Tournament struct
    struct Tournament {
        uint256 id;
        string name;
        string gameType; // "Snake" or "Tetris" (for demo, string is simplest)
        string tournamentType; // "Standard", "TimeDash", "PointThreshold"
        uint256 challengeParam; // e.g. 90 for 90s time dash, or score target
        address creator;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address[] participants;
        mapping(address => uint256) scores;
    }

    // State variables
    uint256 public nextTournamentId = 1;
    mapping(uint256 => Tournament) public tournaments;

    // Events
    event TournamentCreated(uint256 indexed id, address indexed creator, uint256 prizePool, uint256 startTime, uint256 endTime);
    event Joined(uint256 indexed id, address indexed player);
    event ScoreSubmitted(uint256 indexed id, address indexed player, uint256 score);
    event TournamentEnded(uint256 indexed id);

    // Create a new tournament
    function createTournament(
        string calldata name,
        string calldata gameType, // "Snake" or "Tetris"
        string calldata tournamentType, // "Standard", "TimeDash", "PointThreshold"
        uint256 challengeParam // e.g. 90 (seconds) or score target
    ) external payable {
        if (msg.value == 0) revert ZeroPrizePool();

        uint256 tournamentId = nextTournamentId++;
        Tournament storage t = tournaments[tournamentId];
        
        t.id = tournamentId;
        t.name = name;
        t.gameType = gameType;
        t.tournamentType = tournamentType;
        t.challengeParam = challengeParam;
        t.creator = msg.sender;
        t.prizePool = msg.value;
        t.startTime = block.timestamp;
        t.endTime = block.timestamp + 7 days;
        t.isActive = true;

        emit TournamentCreated(tournamentId, msg.sender, msg.value, t.startTime, t.endTime);
    }

    // Join an existing tournament
    function joinTournament(uint256 id) external {
        Tournament storage t = tournaments[id];
        if (t.id == 0) revert TournamentNotFound();
        if (!t.isActive) revert NotActive();
        if (t.scores[msg.sender] != 0 || _isParticipant(t, msg.sender)) revert AlreadyJoined();

        t.participants.push(msg.sender);
        emit Joined(id, msg.sender);
    }

    // Submit score for a tournament
    function submitScore(uint256 id, uint256 score) external {
        Tournament storage t = tournaments[id];
        if (t.id == 0) revert TournamentNotFound();
        if (!t.isActive) revert NotActive();
        if (!_isParticipant(t, msg.sender)) revert NotParticipant();

        t.scores[msg.sender] = score;
        emit ScoreSubmitted(id, msg.sender, score);
    }

    // End a tournament and distribute prize
    function endTournament(uint256 id) external {
        Tournament storage t = tournaments[id];
        if (t.id == 0) revert TournamentNotFound();
        if (!t.isActive) revert NotActive();
        if (msg.sender != t.creator) revert NotCreator();

        t.isActive = false;

        // Find winner (highest score)
        address winner;
        uint256 highestScore;
        for (uint256 i = 0; i < t.participants.length; i++) {
            address participant = t.participants[i];
            if (t.scores[participant] > highestScore) {
                highestScore = t.scores[participant];
                winner = participant;
            }
        }

        // Transfer prize to winner if there is one
        if (winner != address(0) && t.prizePool > 0) {
            (bool success, ) = winner.call{value: t.prizePool}("");
            require(success, "Prize transfer failed");
        }

        emit TournamentEnded(id);
    }

    // Get tournament information
    function getTournamentInfo(uint256 id) external view returns (
        string memory name,
        string memory gameType,
        string memory tournamentType,
        uint256 challengeParam,
        address creator,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        address[] memory participants
    ) {
        Tournament storage t = tournaments[id];
        if (t.id == 0) revert TournamentNotFound();

        return (
            t.name,
            t.gameType,
            t.tournamentType,
            t.challengeParam,
            t.creator,
            t.prizePool,
            t.startTime,
            t.endTime,
            t.isActive,
            t.participants
        );
    }

    // Helper function to check if an address is a participant
    function _isParticipant(Tournament storage t, address user) internal view returns (bool) {
        for (uint256 i = 0; i < t.participants.length; i++) {
            if (t.participants[i] == user) return true;
        }
        return false;
    }

    // Allow contract to receive Ether
    receive() external payable {}
}