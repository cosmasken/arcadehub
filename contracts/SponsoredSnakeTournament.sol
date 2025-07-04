// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title SponsoredSnakeTournament
 * @dev A simplified POC tournament contract with a single prize and max participants.
 *
 * Features:
 * - Max participants per tournament.
 * - Single prize per tournament for simplicity.
 * - Open sponsorship joining for development and testing.
 * - Statically defined list of supported ERC20 prize tokens.
 */
contract SponsoredSnakeTournament is ERC1155, Ownable, ReentrancyGuard {
    using Address for address payable;

    // --- Roles ---
    mapping(address => bool) public admins;
    mapping(address => bool) public sponsors;

    // --- Supported Tokens ---
    mapping(address => bool) public supportedTokens;
    address[] public supportedTokenList;

    // --- Constants for NFT Token IDs ---
    uint256 public constant ACHIEVEMENT_WIN_TOURNAMENT = 2;

    // --- State Variables ---

    struct Prize {
        address tokenContract; // address(0) for native currency
        uint256 amount;
        bool isFunded;
    }

    struct Tournament {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 participantCount;
        address highScorer;
        uint256 highestScore;
        bool ended;
    }

    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => Prize) public tournamentPrizes;
    mapping(uint256 => mapping(address => uint256)) public playerScores;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    uint256 public nextTournamentId;

    // --- Events ---
    event TournamentCreated(uint256 indexed tournamentId, uint256 startTime, uint256 endTime, uint256 maxParticipants);
    event TournamentFunded(uint256 indexed tournamentId, address indexed sponsor, address indexed tokenContract, uint256 amount);
    event ScoreSubmitted(uint256 indexed tournamentId, address indexed player, uint256 score);
    event TournamentEnded(uint256 indexed tournamentId, address indexed winner);
    event ItemMinted(address indexed player, uint256 indexed tokenId, uint256 amount);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(admins[msg.sender], "Caller is not an admin");
        _;
    }

    modifier onlySponsor() {
        require(sponsors[msg.sender], "Caller is not a sponsor");
        _;
    }

    // --- Constructor ---
    constructor(address initialOwner, string memory baseURI)
        ERC1155(baseURI)
        Ownable(initialOwner)
    {
        admins[initialOwner] = true;

        _addSupportedToken(address(0x5d0E342cCD1aD86a16BfBa26f404486940DBE345)); // DAI
        _addSupportedToken(address(0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74)); // USDT
        _addSupportedToken(address(0xC86Fed58edF0981e927160C50ecB8a8B05B32fed)); // USDC
        _addSupportedToken(address(0x150E812D3443699e8b829EF6978057Ed7CB47AE6)); // ARC
    }

    // --- Public Role Management (for Development/Testing) ---
    function joinAsSponsor() external {
        require(!sponsors[msg.sender], "Already a sponsor");
        sponsors[msg.sender] = true;
    }

    // --- Tournament Management (Admin Only) ---
    function createTournament(uint256 _startTime, uint256 _endTime, uint256 _maxParticipants) external onlyAdmin {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_maxParticipants > 0, "Must allow at least one participant");

        uint256 tournamentId = nextTournamentId;
        tournaments[tournamentId] = Tournament({
            id: tournamentId,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            participantCount: 0,
            highScorer: address(0),
            highestScore: 0,
            ended: false
        });

        nextTournamentId++;
        emit TournamentCreated(tournamentId, _startTime, _endTime, _maxParticipants);
    }

    // --- Sponsor Functions (Sponsor Only) ---
    function fundTournament(uint256 _tournamentId, address _tokenContract, uint256 _amount) external payable nonReentrant onlySponsor {
        Tournament storage t = tournaments[_tournamentId];
        Prize storage prize = tournamentPrizes[_tournamentId];
        require(t.id == _tournamentId, "Tournament does not exist");
        require(!prize.isFunded, "Tournament already funded");
        require(_amount > 0, "Prize amount must be positive");

        if (_tokenContract == address(0)) {
            require(msg.value == _amount, "Msg.value must match prize amount for native token");
        } else {
            require(supportedTokens[_tokenContract], "Token not supported");
            require(msg.value == 0, "Do not send native token for ERC20 prizes");
            IERC20(_tokenContract).transferFrom(msg.sender, address(this), _amount);
        }

        prize.tokenContract = _tokenContract;
        prize.amount = _amount;
        prize.isFunded = true;

        emit TournamentFunded(_tournamentId, msg.sender, _tokenContract, _amount);
    }

    // --- Player Interaction ---
    function submitScore(uint256 _tournamentId, uint256 _score) external {
        Tournament storage t = tournaments[_tournamentId];
        require(t.id == _tournamentId, "Tournament does not exist");
        require(!t.ended, "Tournament has ended");
        require(block.timestamp >= t.startTime, "Tournament has not started");

        if (!hasJoined[_tournamentId][msg.sender]) {
            require(t.participantCount < t.maxParticipants, "Tournament is full");
            t.participantCount++;
            hasJoined[_tournamentId][msg.sender] = true;
        }

        if (_score > playerScores[_tournamentId][msg.sender]) {
            playerScores[_tournamentId][msg.sender] = _score;
        }

        if (_score > t.highestScore) {
            t.highestScore = _score;
            t.highScorer = msg.sender;
        }

        emit ScoreSubmitted(_tournamentId, msg.sender, _score);
    }

    // --- Tournament Finalization ---
    function endTournament(uint256 _tournamentId) external nonReentrant {
        Tournament storage t = tournaments[_tournamentId];
        require(t.id == _tournamentId, "Tournament does not exist");
        require(block.timestamp >= t.endTime, "Tournament has not ended yet");
        require(!t.ended, "Tournament already ended");

        t.ended = true;

        address winner = t.highScorer;
        Prize memory prize = tournamentPrizes[_tournamentId];
        if (winner != address(0) && prize.isFunded) {
            _mint(winner, ACHIEVEMENT_WIN_TOURNAMENT, 1, "");
            emit ItemMinted(winner, ACHIEVEMENT_WIN_TOURNAMENT, 1);

            if (prize.tokenContract == address(0)) {
                payable(winner).sendValue(prize.amount);
            } else {
                IERC20(prize.tokenContract).transfer(winner, prize.amount);
            }
        }

        emit TournamentEnded(_tournamentId, winner);
    }
    
    // --- View Functions ---
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokenList;
    }

    // --- Internal Functions ---
    function _addSupportedToken(address _tokenAddress) internal {
        if (!supportedTokens[_tokenAddress]) {
            supportedTokens[_tokenAddress] = true;
            supportedTokenList.push(_tokenAddress);
        }
    }

    // --- URI Management (Owner Only) ---
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}