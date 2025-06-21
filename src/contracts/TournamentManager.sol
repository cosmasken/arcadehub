// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TournamentHub is Ownable, ReentrancyGuard {
    // Custom errors
    error ZeroPrizePool();
    error TokenTransferFailed();
    error InactiveTournament();
    error TournamentHasEnded();
    error AlreadyJoined();
    error NotActivePeriod();
    error NotParticipant();
    error ScoreBelowMinimum();
    error InvalidSignature();
    error NotCreator();
    error NotDemoMode();
    error AlreadyDistributed();
    error DisputePeriodActive();
    error InvalidFeeWallets();
    error FeesTooHigh();
    error InvalidSigner();
    error InvalidTournamentId();
    error NoParticipants();
    error InsufficientPrizePool();
    error InvalidTokenAddress();
    error NEROTransferFailed();

    address public constant NATIVE_TOKEN = address(0); // Represents NERO
    address public developerWallet;
    address public platformWallet;
    address public trustedSigner;
    bool public demoMode;
    uint256 public devFeePercent;
    uint256 public platformFeePercent;
    uint256 public constant MIN_SCORE = 20000;
    uint256 public constant DISPUTE_PERIOD = 2 minutes;

    uint256 public nextTournamentId;

    // Static list of allowed tokens
    mapping(address => bool) public allowedTokens;

    struct Tournament {
        uint256 id;
        string name;
        address creator;
        uint256 prizePool;
        address token; // Token address (0 for NERO)
        uint256 startTime;
        uint256 endTime;
        uint256 distributionTime;
        bool isActive;
        bool prizesDistributed;
        address[] participants;
        mapping(address => uint256) scores;
        mapping(address => bool) isParticipant;
    }

    struct TournamentInfo {
        uint256 id;
        address creator;
        string name;
        uint256 prizePool;
        address token;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        bool isActive;
        bool prizesDistributed;
        uint256 participantScore;
        bool isParticipant;
    }

    mapping(uint256 => Tournament) public tournaments;
    mapping(address => uint256[]) public userCreatedTournaments;
    mapping(address => uint256[]) public userJoinedTournaments;

    event TournamentCreated(uint256 indexed id, address indexed creator, uint256 prizePool, address token, uint256 startTime, uint256 endTime);
    event TournamentJoined(uint256 indexed tournamentId, address indexed participant);
    event ScoreSubmitted(uint256 indexed tournamentId, address indexed participant, uint256 score);
    event TournamentEnded(uint256 indexed tournamentId, uint256 endTime);
    event PrizesDistributed(uint256 indexed tournamentId, address[] winners, uint256[] amounts, address token);
    event FeesUpdated(uint256 devFeePercent, uint256 platformFeePercent);
    event FeeWalletsUpdated(address developerWallet, address platformWallet);
    event TrustedSignerUpdated(address trustedSigner);
    event DemoModeToggled(bool demoMode);
    event TokenAdded(address token);
    event TokenRemoved(address token);

    constructor(
        address[] memory _allowedTokens,
        address _developerWallet,
        address _platformWallet,
        address _trustedSigner,
        bool _demoMode
    ) Ownable(msg.sender) {
        if (_developerWallet == address(0) || _platformWallet == address(0)) revert InvalidFeeWallets();
        if (_trustedSigner == address(0)) revert InvalidSigner();

        developerWallet = _developerWallet;
        platformWallet = _platformWallet;
        trustedSigner = _trustedSigner;
        demoMode = _demoMode;
        devFeePercent = 20;
        platformFeePercent = 5;
        nextTournamentId = 1;

        // Initialize allowed tokens
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            if (_allowedTokens[i] != NATIVE_TOKEN && !isContract(_allowedTokens[i])) revert InvalidTokenAddress();
            allowedTokens[_allowedTokens[i]] = true;
            emit TokenAdded(_allowedTokens[i]);
        }
    }

    function addToken(address token) external onlyOwner {
        if (token != NATIVE_TOKEN && !isContract(token)) revert InvalidTokenAddress();
        allowedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyOwner {
        allowedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function createTournament(string calldata name, uint256 prizePool, address token) external payable nonReentrant {
        if (prizePool == 0) revert ZeroPrizePool();
        if (!allowedTokens[token]) revert InvalidTokenAddress();

        if (token == NATIVE_TOKEN) {
            if (msg.value != prizePool) revert TokenTransferFailed();
        } else {
            if (!IERC20(token).transferFrom(msg.sender, address(this), prizePool)) revert TokenTransferFailed();
        }

        uint256 tournamentId = nextTournamentId++;
        Tournament storage newTournament = tournaments[tournamentId];
        newTournament.id = tournamentId;
        newTournament.name = name;
        newTournament.creator = msg.sender;
        newTournament.prizePool = prizePool;
        newTournament.token = token;
        newTournament.startTime = block.timestamp;
        newTournament.endTime = block.timestamp + 600; // 10 minutes for demo
        newTournament.isActive = true;
        newTournament.distributionTime = newTournament.endTime + DISPUTE_PERIOD;

        userCreatedTournaments[msg.sender].push(tournamentId);

        emit TournamentCreated(tournamentId, msg.sender, prizePool, token, newTournament.startTime, newTournament.endTime);
    }

    function joinTournament(uint256 tournamentId) external {
        Tournament storage t = tournaments[tournamentId];
        if (t.id == 0) revert InvalidTournamentId();
        if (!t.isActive) revert InactiveTournament();
        if (block.timestamp >= t.endTime) revert TournamentHasEnded();
        if (t.isParticipant[msg.sender]) revert AlreadyJoined();

        t.participants.push(msg.sender);
        t.isParticipant[msg.sender] = true;
        userJoinedTournaments[msg.sender].push(tournamentId);

        emit TournamentJoined(tournamentId, msg.sender);
    }

    function submitTournamentScore(uint256 tournamentId, uint256 score, bytes calldata signature) external {
        Tournament storage t = tournaments[tournamentId];
        if (t.id == 0) revert InvalidTournamentId();
        if (block.timestamp < t.startTime || block.timestamp > t.endTime) revert NotActivePeriod();
        if (!t.isParticipant[msg.sender]) revert NotParticipant();
        if (score < MIN_SCORE) revert ScoreBelowMinimum();

        if (!demoMode) {
            bytes32 messageHash = keccak256(abi.encodePacked(tournamentId, msg.sender, score));
            bytes32 ethSignedMessageHash = toEthSignedMessageHash(messageHash);
            address signer = ECDSA.recover(ethSignedMessageHash, signature);
            if (signer != trustedSigner) revert InvalidSignature();
        }

        t.scores[msg.sender] = score;

        emit ScoreSubmitted(tournamentId, msg.sender, score);
    }

    function forceEndTournament(uint256 tournamentId) external {
        Tournament storage t = tournaments[tournamentId];
        if (t.id == 0) revert InvalidTournamentId();
        if (msg.sender != t.creator) revert NotCreator();
        if (!demoMode) revert NotDemoMode();
        if (!t.isActive) revert InactiveTournament();

        t.isActive = false;
        t.endTime = block.timestamp;
        t.distributionTime = block.timestamp + DISPUTE_PERIOD;

        emit TournamentEnded(tournamentId, t.endTime);
    }

    function finalizeTournament(uint256 tournamentId) external nonReentrant {
        Tournament storage t = tournaments[tournamentId];
        if (t.id == 0) revert InvalidTournamentId();
        if (block.timestamp <= t.endTime) revert TournamentHasEnded();
        if (t.prizesDistributed) revert AlreadyDistributed();
        if (block.timestamp < t.distributionTime) revert DisputePeriodActive();
        if (t.participants.length == 0) revert NoParticipants();

        t.prizesDistributed = true;
        t.isActive = false;

        _distributePrizes(tournamentId, t);
    }

    function _distributePrizes(uint256 tournamentId, Tournament storage t) internal {
        uint256 totalFees = (t.prizePool * (devFeePercent + platformFeePercent)) / 100;
        if (totalFees >= t.prizePool) revert InsufficientPrizePool();
        uint256 prizePoolAfterFees = t.prizePool - totalFees;

        if (totalFees > 0) {
            uint256 devFee = (t.prizePool * devFeePercent) / 100;
            uint256 platformFee = totalFees - devFee;
            if (t.token == NATIVE_TOKEN) {
                if (devFee > 0) {
                    (bool devSuccess, ) = developerWallet.call{value: devFee}("");
                    if (!devSuccess) revert NEROTransferFailed();
                }
                if (platformFee > 0) {
                    (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
                    if (!platformSuccess) revert NEROTransferFailed();
                }
            } else {
                if (devFee > 0 && !IERC20(t.token).transfer(developerWallet, devFee)) revert TokenTransferFailed();
                if (platformFee > 0 && !IERC20(t.token).transfer(platformWallet, platformFee)) revert TokenTransferFailed();
            }
        }

        address[] memory winners = new address[](t.participants.length);
        uint256[] memory amounts = new uint256[](t.participants.length);

        address[] memory sortedParticipants = _sortParticipants(t);
        uint256 participantCount = t.participants.length;

        if (participantCount == 1) {
            winners[0] = sortedParticipants[0];
            amounts[0] = prizePoolAfterFees;
        } else if (participantCount == 2) {
            winners[0] = sortedParticipants[0];
            amounts[0] = (prizePoolAfterFees * 60) / 100;
            winners[1] = sortedParticipants[1];
            amounts[1] = (prizePoolAfterFees * 40) / 100;
        } else if (participantCount == 3) {
            winners[0] = sortedParticipants[0];
            amounts[0] = (prizePoolAfterFees * 25) / 100;
            winners[1] = sortedParticipants[1];
            amounts[1] = (prizePoolAfterFees * 15) / 100;
            winners[2] = sortedParticipants[2];
            amounts[2] = (prizePoolAfterFees * 10) / 100;
        } else {
            // Top 3: 50% (25%, 15%, 10%)
            winners[0] = sortedParticipants[0];
            amounts[0] = (prizePoolAfterFees * 25) / 100;
            winners[1] = sortedParticipants[1];
            amounts[1] = (prizePoolAfterFees * 15) / 100;
            winners[2] = sortedParticipants[2];
            amounts[2] = (prizePoolAfterFees * 10) / 100;

            // Ranks 4–10: 50% quadratic-like distribution
            uint256 remainingPool = (prizePoolAfterFees * 50) / 100;
            uint256 maxRank = participantCount < 10 ? participantCount : 10;
            uint256 weightSum = 0;

            // Calculate weight sum for ranks 4 to maxRank
            for (uint256 rank = 4; rank <= maxRank; rank++) {
                weightSum += 1e18 / ((rank - 3) * (rank - 3)); // 1/(rank-3)^2 scaled by 1e18
            }

            // Distribute to ranks 4 to maxRank
            for (uint256 rank = 4; rank <= maxRank; rank++) {
                uint256 i = rank - 1; // Array index (0-based)
                winners[i] = sortedParticipants[i];
                uint256 weight = 1e18 / ((rank - 3) * (rank - 3));
                amounts[i] = (remainingPool * weight) / weightSum;
            }
        }

        for (uint256 i = 0; i < winners.length; i++) {
            if (amounts[i] > 0) {
                if (t.token == NATIVE_TOKEN) {
                    (bool success, ) = winners[i].call{value: amounts[i]}("");
                    if (!success) revert NEROTransferFailed();
                } else {
                    if (!IERC20(t.token).transfer(winners[i], amounts[i])) revert TokenTransferFailed();
                }
            }
        }

        emit PrizesDistributed(tournamentId, winners, amounts, t.token);
    }

    function _sortParticipants(Tournament storage t) internal view returns (address[] memory) {
        address[] memory sortedParticipants = new address[](t.participants.length);
        uint256[] memory sortedScores = new uint256[](t.participants.length);

        for (uint256 i = 0; i < t.participants.length; i++) {
            sortedParticipants[i] = t.participants[i];
            sortedScores[i] = t.scores[t.participants[i]];
        }

        for (uint256 i = 0; i < sortedParticipants.length - 1; i++) {
            for (uint256 j = 0; j < sortedParticipants.length - i - 1; j++) {
                if (sortedScores[j] < sortedScores[j + 1]) {
                    (sortedScores[j], sortedScores[j + 1]) = (sortedScores[j + 1], sortedScores[j]);
                    (sortedParticipants[j], sortedParticipants[j + 1]) = (sortedParticipants[j + 1], sortedParticipants[j]);
                }
            }
        }

        return sortedParticipants;
    }

    function setFeeWallets(address _developerWallet, address _platformWallet) external onlyOwner {
        if (_developerWallet == address(0) || _platformWallet == address(0)) revert InvalidFeeWallets();
        developerWallet = _developerWallet;
        platformWallet = _platformWallet;
        emit FeeWalletsUpdated(_developerWallet, _platformWallet);
    }

    function setFees(uint256 _devFeePercent, uint256 _platformFeePercent) external onlyOwner {
        if (_devFeePercent + _platformFeePercent > 20) revert FeesTooHigh();
        devFeePercent = _devFeePercent;
        platformFeePercent = _platformFeePercent;
        emit FeesUpdated(_devFeePercent, _platformFeePercent);
    }

    function setTrustedSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) revert InvalidSigner();
        trustedSigner = _signer;
        emit TrustedSignerUpdated(_signer);
    }

    function toggleDemoMode() external onlyOwner {
        demoMode = !demoMode;
        emit DemoModeToggled(demoMode);
    }

    function getTournamentInfo(uint256 tournamentId, address user) external view returns (TournamentInfo memory) {
        Tournament storage t = tournaments[tournamentId];
        if (t.id == 0) revert InvalidTournamentId();
        return TournamentInfo({
            id: t.id,
            creator: t.creator,
            name: t.name,
            prizePool: t.prizePool,
            token: t.token,
            startTime: t.startTime,
            endTime: t.endTime,
            participants: t.participants,
            isActive: t.isActive,
            prizesDistributed: t.prizesDistributed,
            participantScore: t.scores[user],
            isParticipant: t.isParticipant[user]
        });
    }

    function getActiveTournamentIds() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](nextTournamentId - 1);
        uint256 count = 0;
        for (uint256 i = 1; i < nextTournamentId; i++) {
            if (tournaments[i].isActive && block.timestamp < tournaments[i].endTime) {
                activeIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }
        return result;
    }

    function getUserCreatedTournaments(address user) external view returns (uint256[] memory) {
        return userCreatedTournaments[user];
    }

    function getUserJoinedTournaments(address user) external view returns (uint256[] memory) {
        return userJoinedTournaments[user];
    }

    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function toEthSignedMessageHash(bytes32 messageHash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    receive() external payable {}
}