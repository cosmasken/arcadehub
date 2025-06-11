// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TournamentHub is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    address public trustedSigner;

    struct Tournament {
        uint256 id;
        address creator;
        string name;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        mapping(address => bool) isParticipant;
        bool isActive;
        bool prizesDistributed;
        mapping(address => uint256) scores;
    }

    struct TournamentInfo {
        uint256 id;
        address creator;
        string name;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        bool isActive;
        bool prizesDistributed;
        uint256 participantScore;
        bool isParticipant;
    }

    uint256 public nextTournamentId;
    mapping(uint256 => Tournament) public tournaments;

    event TournamentCreated(uint256 indexed id, address indexed creator, uint256 prizePool, uint256 startTime, uint256 endTime);
    event TournamentJoined(uint256 indexed id, address indexed player);
    event TournamentScoreSubmitted(uint256 indexed id, address indexed player, uint256 score);
    event TournamentPrizesDistributed(uint256 indexed id);

    constructor(address _arcToken, address _initialOwner) Ownable(_initialOwner) {
        require(_arcToken != address(0), "Invalid token address");
        arcToken = IERC20(_arcToken);
    }

    function createTournament(
        string calldata name,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime
    ) external nonReentrant {
        require(prizePool > 0, "Prize pool required");
        require(startTime < endTime, "Invalid time");
        require(arcToken.transferFrom(msg.sender, address(this), prizePool), "Prize transfer failed");

        Tournament storage t = tournaments[nextTournamentId];
        t.id = nextTournamentId;
        t.creator = msg.sender;
        t.name = name;
        t.prizePool = prizePool;
        t.startTime = startTime;
        t.endTime = endTime;
        t.isActive = true;

        emit TournamentCreated(nextTournamentId, msg.sender, prizePool, startTime, endTime);
        nextTournamentId++;
    }

    function joinTournament(uint256 tournamentId) external {
        Tournament storage t = tournaments[tournamentId];
        require(t.isActive, "Inactive");
        require(block.timestamp < t.endTime, "Ended");
        require(!t.isParticipant[msg.sender], "Already joined");
        t.participants.push(msg.sender);
        t.isParticipant[msg.sender] = true;
        emit TournamentJoined(tournamentId, msg.sender);
    }

    function setTrustedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer address");
        trustedSigner = _signer;
    }

    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function submitTournamentScore(
        uint256 tournamentId,
        uint256 score,
        bytes calldata signature
    ) external {
        Tournament storage t = tournaments[tournamentId];
        require(t.isActive, "Inactive");
        require(block.timestamp >= t.startTime && block.timestamp <= t.endTime, "Not active");
        require(t.isParticipant[msg.sender], "Not registered");
        require(score > t.scores[msg.sender], "Score not higher");

        bytes32 messageHash = keccak256(abi.encodePacked(tournamentId, msg.sender, score));
        bytes32 ethSignedMessageHash = toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(signer == trustedSigner, "Invalid signature");

        t.scores[msg.sender] = score;
        emit TournamentScoreSubmitted(tournamentId, msg.sender, score);
    }

    function distributeTournamentPrizes(
        uint256 tournamentId,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        Tournament storage t = tournaments[tournamentId];
        require(block.timestamp > t.endTime, "Not ended");
        require(!t.prizesDistributed, "Already distributed");
        require(winners.length == amounts.length, "Length mismatch");
        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(total <= t.prizePool, "Exceeds pool");

        for (uint i = 0; i < winners.length; i++) {
            require(arcToken.transfer(winners[i], amounts[i]), "Prize transfer failed");
        }
        t.prizesDistributed = true;
        t.isActive = false;
        emit TournamentPrizesDistributed(tournamentId);
    }

    function getTournamentInfo(uint256 tournamentId, address user) external view returns (TournamentInfo memory) {
        Tournament storage t = tournaments[tournamentId];
        return TournamentInfo({
            id: t.id,
            creator: t.creator,
            name: t.name,
            prizePool: t.prizePool,
            startTime: t.startTime,
            endTime: t.endTime,
            participants: t.participants,
            isActive: t.isActive,
            prizesDistributed: t.prizesDistributed,
            participantScore: t.scores[user],
            isParticipant: t.isParticipant[user]
        });
    }

    function getAllTournamentIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](nextTournamentId);
        for (uint256 i = 0; i < nextTournamentId; i++) {
            ids[i] = i;
        }
        return ids;
    }

    function getActiveTournamentIds() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextTournamentId; i++) {
            if (tournaments[i].isActive) {
                count++;
            }
        }
        uint256[] memory ids = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextTournamentId; i++) {
            if (tournaments[i].isActive) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }

    function getTournamentScores(uint256 tournamentId) external view returns (address[] memory, uint256[] memory) {
        Tournament storage t = tournaments[tournamentId];
        uint256[] memory scores = new uint256[](t.participants.length);
        for (uint256 i = 0; i < t.participants.length; i++) {
            scores[i] = t.scores[t.participants[i]];
        }
        return (t.participants, scores);
    }

    function getUserCreatedTournaments(address creator) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextTournamentId; i++) {
            if (tournaments[i].creator == creator) {
                count++;
            }
        }
        uint256[] memory ids = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextTournamentId; i++) {
            if (tournaments[i].creator == creator) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }
}