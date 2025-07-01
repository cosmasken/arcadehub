
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import WelcomeModal from '../components/WelcomeModal';
import Tooltip from '../components/Tooltip';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GamepadIcon, Users, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/useWalletStore';
import { getProvider } from '../lib/aaUtils';
import { ethers } from 'ethers';
import { TESTNET_CONFIG } from '@/config';

const TOKEN_ABI = "../abi/ArcadeToken.json";

const Index = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWalletStore();
  const [showWalletTooltip, setShowWalletTooltip] = useState(false);

  // Show wallet tooltip on first visit after welcome modal
  useEffect(() => {
    const hasSeenWalletTooltip = localStorage.getItem('hasSeenWalletTooltip');
    if (!hasSeenWalletTooltip && isConnected === false) {
      const timer = setTimeout(() => {
        setShowWalletTooltip(true);
        // Hide after 5 seconds
        setTimeout(() => setShowWalletTooltip(false), 5000);
        localStorage.setItem('hasSeenWalletTooltip', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);
  const featuredGames = [
    {
      id: "honey-clicker",
      title: "HONEY CLICKER",
      description: "Click to earn sweet honey and build your bee empire. Buy upgrades and unlock achievements in this addictive idle game.",
      image: "/games/honey-clicker.svg",
      category: "IDLE",
      players: 15420,
      rating: 4.8,
      prize: "50 NERO",
      status: "live" as const
    },
    {
      id: "space-invaders",
      title: "SPACE INVADERS",
      description: "Defend Earth from waves of alien invaders in this retro arcade classic. Compete for high scores and earn crypto rewards.",
      image: "/games/space-invaders.svg",
      category: "ARCADE",
      players: 10234,
      rating: 4.7,
      prize: "30 NERO",
      status: "beta" as const
    },
    {
      id: "tetris",
      title: "TETRIS",
      description: "Arrange falling blocks to complete lines and score points. A timeless puzzle game with a competitive twist.",
      image: "/games/tetris.svg",
      category: "PUZZLE",
      players: 8921,
      rating: 4.9,
      prize: "25 NERO",
      status: "beta" as const
    },
    {
      id: "snake",
      title: "SNAKE",
      description: "Control a snake that grows as you eat more food. Compete for high scores and earn crypto rewards.",
      image: "/games/snake.svg",
      category: "ARCADE",
      players: 11245,
      rating: 4.6,
      prize: "20 NERO",
      status: "beta" as const
    }
  ];

  const stats = [
    {
      title: "ACTIVE PLAYERS",
      value: "47,892",
      change: "+12.5% from last week",
      icon: Users,
      trend: "up" as const
    }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <Header />
      <WelcomeModal />

      {/* Stats Banner - Moved to top */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-center items-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center mx-4">
                <stat.icon className="w-5 h-5 text-purple-400 mr-2" />
                <div>
                  <div className="text-sm text-gray-400">{stat.title}</div>
                  <div className="font-bold text-lg">{stat.value}</div>
                </div>
              </div>
            ))}
            
            <div className="ml-auto relative">
              <Tooltip 
                content={isConnected ? "Wallet Connected" : "Connect your wallet to earn rewards"}
                position="bottom"
                className={showWalletTooltip ? 'block' : 'hidden'}
              >
                <button
                  onClick={!isConnected ? connectWallet : undefined}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isConnected 
                      ? 'bg-green-900/50 text-green-400 border border-green-800' 
                      : 'bg-purple-900/50 text-purple-400 hover:bg-purple-800/50 border border-purple-800'
                  }`}
                >
                  <WalletIcon className="w-5 h-5 mr-2" />
                  {isConnected ? 'Connected' : 'Connect Wallet'}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Compact */}
      <section className="pt-12 pb-8 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-cyan-400">
            RETRO ARCADE
          </h1>
          <p className="text-lg md:text-xl mb-6 text-green-400">
            PLAY_TO_EARN // WIN_CRYPTO_PRIZES
          </p>
          
          {/* Beta Warning - Smaller and less prominent */}
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 text-sm">
              <span className="font-semibold text-yellow-300">BETA:</span> 
              <span className="text-yellow-200"> Platform is in testing. Progress may be reset.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <GamepadIcon className="w-6 h-6 mr-2 text-purple-400" />
            Featured Games
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          
          {/* Additional CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4 text-white">More Games Coming Soon!</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              We're constantly adding new games to the arcade. Stay tuned for more exciting titles and features.
            </p>
          </div>
        </div>
      </section>

      {/* Total Available Tokens Section */}
      <section className="py-8 px-6 ">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="p-6 flex flex-col items-center">
            <h2 className="text-sm sm:text-3xl md:text-5xl font-bold mb-6 text-cyan-400 neon-text">
               TOTAL AVAILABLE TOKENS 
            </h2>
              {/* <span className="text-cyan-400 font-bold text-lg mb-2 neon-text"></span> */}
              <span className="text-3xl md:text-5xl font-mono text-green-400 mb-1 neon-text"> 
                1,000,000 ARCADE</span>
              <span className="text-xs text-cyan-200 neon-text">Distributed across all games</span>
            </div>
          </div>
        </section>



        {/* CTA Section */}
      <section className="py-16 px-6 bg-black/50">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-sm sm:text-3xl md:text-5xl font-bold mb-6 text-cyan-400 neon-text">
            JOIN_THE_REVOLUTION 
          </h2>
          <p className="text-xl mb-8 text-green-400 tracking-wider">
            CONNECT_WALLET // START_EARNING // BECOME_LEGEND
          </p>
          <Link to="/developer">
            <Button className="bg-green-400 text-black hover:bg-cyan-400 font-mono text-lg px-8 py-4 tracking-wider border-2 border-green-400 hover:border-cyan-400">
              UPLOAD_YOUR_GAME
            </Button>
          </Link>
        </div>
      </section>

      <div className="mt-16 text-center px-6">
        <Card className="p-8 bg-gray-900/50 border border-gray-800">
          <h3 className="text-3xl font-bold text-cyan-400 mb-4">
            READY TO DOMINATE?
          </h3>
          <p className="text-green-400 mb-6">
            Join thousands of players competing for glory and rewards
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge 
              onClick={() => navigate('/tournaments')}
              className="bg-green-400 text-black px-4 py-2 cursor-pointer hover:bg-green-300 transition-colors"
            >
              🏆 Tournaments
            </Badge>
            <Badge 
              className="bg-cyan-400 text-black px-4 py-2 cursor-pointer hover:bg-cyan-300 transition-colors"
            >
              💰 Rewards
            </Badge>
            <Badge
              onClick={() => navigate('/leaderboard')}
              className="bg-yellow-400 text-black px-4 py-2 cursor-pointer hover:bg-yellow-300 transition-colors"
            >
              📈 Leaderboards
            </Badge>
          </div>
        </Card>
      </div>
      </div>
  );
};

export default Index;
