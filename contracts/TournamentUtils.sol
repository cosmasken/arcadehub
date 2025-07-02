// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SnakeTournament.sol";

library TournamentUtils {
    struct TournamentInfo {
        uint256 id;
        string name;
        SnakeTournament.TournamentType tournamentType;
        uint256 startTime;
        uint256 endTime;
        uint256 duration;
        uint256 entryFee;
        uint256 prizePool;
        uint256 targetScore;
        address creator;
        SnakeTournament.TournamentStatus status;
        uint256 playerCount;
    }
    
    function getTournamentInfo(SnakeTournament tournament) 
        external 
        view 
        returns (TournamentInfo memory) 
    {
        (
            uint256 id,
            string memory name,
            SnakeTournament.TournamentType tournamentType,
            uint256 startTime,
            uint256 endTime,
            uint256 duration,
            uint256 entryFee,
            uint256 prizePool,
            uint256 targetScore,
            address creator,
            SnakeTournament.TournamentStatus status,
            uint256 playerCount
        ) = tournament.getTournamentInfo();
        
        return TournamentInfo({
            id: id,
            name: name,
            tournamentType: tournamentType,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            entryFee: entryFee,
            prizePool: prizePool,
            targetScore: targetScore,
            creator: creator,
            status: status,
            playerCount: playerCount
        });
    }
    
    function getTournamentStatusString(SnakeTournament.TournamentStatus status) 
        external 
        pure 
        returns (string memory) 
    {
        if (status == SnakeTournament.TournamentStatus.Open) return "Open";
        if (status == SnakeTournament.TournamentStatus.InProgress) return "In Progress";
        if (status == SnakeTournament.TournamentStatus.Completed) return "Completed";
        if (status == SnakeTournament.TournamentStatus.Cancelled) return "Cancelled";
        return "Unknown";
    }
    
    function getTournamentTypeString(SnakeTournament.TournamentType tType) 
        external 
        pure 
        returns (string memory) 
    {
        if (tType == SnakeTournament.TournamentType.TimeAttack) return "Time Attack";
        if (tType == SnakeTournament.TournamentType.Survival) return "Survival";
        if (tType == SnakeTournament.TournamentType.TargetScore) return "Target Score";
        if (tType == SnakeTournament.TournamentType.Endless) return "Endless";
        return "Unknown";
    }
}
