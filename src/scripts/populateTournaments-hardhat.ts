import { ethers } from "hardhat";
import TournamentHubABI from "../abi/TournamentHub.json";
import { TESTNET_CONFIG } from "../config";

async function main() {
  const [deployer] = await ethers.getSigners();
  const ARCADE_TOKEN = TESTNET_CONFIG.smartContracts.arcadeToken;
  const TOURNAMENT_HUB = TESTNET_CONFIG.smartContracts.tournamentHub;
  const tournamentHub = new ethers.Contract(TOURNAMENT_HUB, TournamentHubABI, deployer);

  const tournaments = [
    // Native token tournaments
    {
      name: "Snake 90s Dash (NERO)",
      gameType: "Snake",
      tournamentType: "TimeDash",
      challengeParam: 90,
      prizePool: ethers.parseEther("0.5"),
      useNative: true,
    },
    {
      name: "Tetris 100k Challenge (NERO)",
      gameType: "Tetris",
      tournamentType: "PointThreshold",
      challengeParam: 100000,
      prizePool: ethers.parseEther("1"),
      useNative: true,
    },
    {
      name: "Snake Open (NERO)",
      gameType: "Snake",
      tournamentType: "Standard",
      challengeParam: 0,
      prizePool: ethers.parseEther("0.3"),
      useNative: true,
    },
    // Arcade token tournaments
    {
      name: "Tetris 60s Sprint (ARCADE)",
      gameType: "Tetris",
      tournamentType: "TimeDash",
      challengeParam: 60,
      prizePool: ethers.parseUnits("1000", 18),
      useNative: false,
    },
    {
      name: "Snake 200k Master (ARCADE)",
      gameType: "Snake",
      tournamentType: "PointThreshold",
      challengeParam: 200000,
      prizePool: ethers.parseUnits("5000", 18),
      useNative: false,
    },
    {
      name: "Tetris Open (ARCADE)",
      gameType: "Tetris",
      tournamentType: "Standard",
      challengeParam: 0,
      prizePool: ethers.parseUnits("2000", 18),
      useNative: false,
    },
    {
      name: "Snake Blitz (ARCADE)",
      gameType: "Snake",
      tournamentType: "TimeDash",
      challengeParam: 45,
      prizePool: ethers.parseUnits("750", 18),
      useNative: false,
    },
    {
      name: "Tetris Marathon (ARCADE)",
      gameType: "Tetris",
      tournamentType: "PointThreshold",
      challengeParam: 300000,
      prizePool: ethers.parseUnits("8000", 18),
      useNative: false,
    },
    {
      name: "Snake Pro League (ARCADE)",
      gameType: "Snake",
      tournamentType: "Standard",
      challengeParam: 0,
      prizePool: ethers.parseUnits("1500", 18),
      useNative: false,
    },
    {
      name: "Tetris Ultra Dash (ARCADE)",
      gameType: "Tetris",
      tournamentType: "TimeDash",
      challengeParam: 120,
      prizePool: ethers.parseUnits("2500", 18),
      useNative: false,
    },
    {
      name: "Snake 50k Rookie (ARCADE)",
      gameType: "Snake",
      tournamentType: "PointThreshold",
      challengeParam: 50000,
      prizePool: ethers.parseUnits("400", 18),
      useNative: false,
    },
    {
      name: "Tetris Quickfire (ARCADE)",
      gameType: "Tetris",
      tournamentType: "TimeDash",
      challengeParam: 30,
      prizePool: ethers.parseUnits("350", 18),
      useNative: false,
    },
    {
      name: "Snake Classic (ARCADE)",
      gameType: "Snake",
      tournamentType: "Standard",
      challengeParam: 0,
      prizePool: ethers.parseUnits("1000", 18),
      useNative: false,
    },
    {
      name: "Tetris 200k Showdown (ARCADE)",
      gameType: "Tetris",
      tournamentType: "PointThreshold",
      challengeParam: 200000,
      prizePool: ethers.parseUnits("6000", 18),
      useNative: false,
    },
    {
      name: "Snake Lightning (ARCADE)",
      gameType: "Snake",
      tournamentType: "TimeDash",
      challengeParam: 20,
      prizePool: ethers.parseUnits("250", 18),
      useNative: false,
    },
    {
      name: "Tetris Legends (ARCADE)",
      gameType: "Tetris",
      tournamentType: "Standard",
      challengeParam: 0,
      prizePool: ethers.parseUnits("3500", 18),
      useNative: false,
    },
    {
      name: "Snake 300k Elite (ARCADE)",
      gameType: "Snake",
      tournamentType: "PointThreshold",
      challengeParam: 300000,
      prizePool: ethers.parseUnits("9000", 18),
      useNative: false,
    },
    {
      name: "Tetris Blitz (ARCADE)",
      gameType: "Tetris",
      tournamentType: "TimeDash",
      challengeParam: 90,
      prizePool: ethers.parseUnits("1800", 18),
      useNative: false,
    },
  ];

  for (const t of tournaments) {
    try {
      let tx;
      if (t.useNative) {
        tx = await tournamentHub.createTournament(
          t.name,
          t.gameType,
          t.tournamentType,
          t.challengeParam,
          { value: t.prizePool }
        );
      } else {
        // Approve Arcade token if not already approved
        const arcadeToken = new ethers.Contract(ARCADE_TOKEN, [
          "function approve(address,uint256) public returns (bool)"
        ], deployer);
        const approveTx = await arcadeToken.approve(TOURNAMENT_HUB, t.prizePool);
        await approveTx.wait();

        tx = await tournamentHub.createTournament(
          t.name,
          t.gameType,
          t.tournamentType,
          t.challengeParam,
          { value: 0 }
        );
      }
      const receipt = await tx.wait();
      console.log(`Created tournament: ${t.name} | Hash: ${receipt.hash}`);
    } catch (err) {
      console.error(`Failed to create tournament: ${t.name}`, err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
