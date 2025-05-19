# ArcadeHub

ArcadeHub is a decentralized gaming platform on the NERO Chain, blending Web2 simplicity with Web3 ownership. Players enjoy casual arcade games, earn ARC tokens and NFTs, and own their rewards. Developers upload games, earning 70% of revenue, fostering a creator-driven ecosystem. Built with React, Pixi.js, and Solidity, ArcadeHub uses NERO’s Paymaster for gasless transactions, making Web3 gaming accessible to all.

**URL**: arcadehub-neon-nights.lovable.app

## Features

- **Gasless Gameplay**: Play 5 arcade games (Star Blaster, Puzzle Pop, Turbo Dash, Clicker Craze, Alien Quest) with social logins (Web3Auth, MetaMask), no gas fees via Paymaster (Type 0, 1, 2).
- **NFT Rewards**: Claim NFTs for achievements (e.g., 100 points, no-restart completion) using `NeroNFT.sol`, tradeable in-game.
- **Developer Ecosystem**: Upload games via `GameHub.sol`, earn 70% revenue (30% to platform), with gasless uploads.
- **Tokenomics**: 100M ARC tokens (`ARCToken.sol`) reward players (40%), developers (20%), and fund Paymaster (20%), with vesting and burns for sustainability.
- **Vibrant UI**: React-based interface with Pixi.js games, featuring game library, profiles, rewards tracker, and developer portal.

## Tokenomics

- **Total Supply**: 100,000,000 ARC
- **Allocation**:
  - Players (40%): Gameplay (5–50 ARC/game, 200 ARC/day cap), referrals (20 ARC/friend), NFT claims (10 ARC).
  - Developers (20%): 70% revenue from in-game purchases (e.g., 1 ARC per 10 ARC spent).
  - Treasury (20%): Paymaster funding (100 ARC/user), buy-backs.
  - Team & Marketing (15%): Community campaigns.
  - Liquidity & Staking (5%): Future features.
- **Sustainability**: 7-day vesting for players, 30-day for developers; 1% burn on purchases; 50% platform revenue buys back ARC.

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Hardhat
- NERO Chain testnet wallet with test tokens
- Pinata API key for IPFS

### Setup

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/cosmasken/arcadehub-neon-nights.git

# Step 2: Navigate to the project directory.
cd arcadehub-neon-nights

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Demo

Watch our 3-minute demo showcasing ArcadeHub’s features:

- Gameplay with ARC/NFT rewards (Star Blaster, Puzzle Pop)
- Developer game upload (Alien Quest)
- Gasless UX with Paymaster
- Profiles and rewards tracker

<!-- [Demo Video](https://youtube.com/your-video-link) | [Live Demo](https://arcadehub.vercel.app) -->

## Smart Contracts

- **ARCToken.sol**: ERC-20, 100M ARC for rewards and payouts
- **NeroNFT.sol**: ERC-721 for NFT achievements (e.g., 100 points, no-restart)
- **GameHub.sol**: Manages game uploads, 70/30 revenue split

## Testing

- Simulate 100 players: Play games, claim NFTs, refer friends
- Simulate 5 developers: Upload games, claim payouts
- Run tests: `npx hardhat test` (contracts), `npm test` (UI)

Feedback welcome! Try ArcadeHub and share your thoughts