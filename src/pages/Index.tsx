
import React from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import StatsCard from '../components/StatsCard';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GamepadIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProvider } from '../lib/aaUtils';
import { ethers } from 'ethers';
import { TESTNET_CONFIG } from '@/config';

const TOKEN_ABI = "../abi/ArcadeToken.json";

const Index = () => {

  const navigate = useNavigate();
  const featuredGames = [
    {
      id: "honey-clicker",
      title: "HONEY CLICKER",
      description: "Click to earn sweet honey and build your bee empire. Buy upgrades and unlock achievements in this addictive idle game.",
      image: "https://gateway.pinata.cloud/ipfs/bafkreieakkvzailupjytuioiwrrm7d37kw2eqxp52lv7svg4b3dimtku2q",
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
      image: "https://gateway.pinata.cloud/ipfs/bafkreif5x7q6z3v5j2k4m7y5x6z3v5j2k4m7y5x6z3v5j2k4m7y5x6z3v5j2k4",
      category: "ARCADE",
      players: 10234,
      rating: 4.5,
      prize: "30 NERO",
      status: "beta" as const
    },
    {
      id: "pacman",
      title: "PAC-MAN",
      description: "Defend Earth from waves of alien invaders in this retro arcade classic. Compete for high scores and earn crypto rewards.",
      image: "https://gateway.pinata.cloud/ipfs/bafkreif5x7q6z3v5j2k4m7y5x6z3v5j2k4m7y5x6z3v5j2k4m7y5x6z3v5j2k4",
      category: "ARCADE",
      players: 10234,
      rating: 4.5,
      prize: "30 NERO",
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

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-sm sm:text-5xl md:text-7xl font-bold mb-6 text-cyan-400 neon-text">
              &gt; RETRO ARCADE &lt;
            </h1>
            {/* Beta Warning Section */}
            <div className="mb-6">
              <div className="bg-yellow-900/80 border-2 border-yellow-400 rounded-lg p-4 mx-auto max-w-2xl flex flex-col items-center">
                <span className="text-yellow-300 font-bold text-lg mb-2">⚠️ BETA WARNING</span>
                <p className="text-yellow-200 text-sm">
                  This platform is currently in <span className="font-bold">BETA</span>. Your achievements and progress may be <span className="font-bold">reset</span> in case of upgrades or changes to the system. Please play and test, but keep in mind that your data is not guaranteed to persist.
                </p>
              </div>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-green-400 tracking-wider">
              PLAY_TO_EARN // WIN_CRYPTO_PRIZES // DOMINATE_LEADERBOARDS
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/games/honey-clicker">
                <Button className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-sm md:text-lg px-8 py-4 tracking-wider border-2 border-cyan-400 hover:border-green-400">
                  <GamepadIcon className="w-5 h-5" />
                  &gt; PLAY_HONEY_CLICKER
                </Button>
              </Link>
              <Link to="/collections">
                <Button className="bg-transparent text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono text-lg px-8 py-4 tracking-wider border-2 border-cyan-400">
                  &gt; VIEW_COLLECTIONS
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 bg-black/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </section>

         {/* Total Available Tokens Section */}
        <section className="py-8 px-6 ">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="p-6 flex flex-col items-center">
              <h2 className="text-sm sm:text-3xl md:text-5xl font-bold mb-6 text-cyan-400 neon-text">
              &gt; TOTAL AVAILABLE TOKENS &lt;
            </h2>
              {/* <span className="text-cyan-400 font-bold text-lg mb-2 neon-text"></span> */}
              <span className="text-3xl md:text-5xl font-mono text-green-400 mb-1 neon-text"> 
                1,000,000 ARCARC</span>
              <span className="text-xs text-cyan-200 neon-text">Distributed across all games</span>
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-cyan-400 neon-text">
                &gt; FEATURED_GAMES &lt;
              </h2>
              <p className="text-green-400 text-lg tracking-wider">
                HIGH_STAKES // BIG_REWARDS // PURE_SKILL
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredGames.map((game) => (
                <Link key={game.id} to={`/games/${game.id}`}>
                  <GameCard game={game} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-black/50">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-sm sm:text-3xl md:text-5xl font-bold mb-6 text-cyan-400 neon-text">
              &gt; JOIN_THE_REVOLUTION &lt;
            </h2>
            <p className="text-xl mb-8 text-green-400 tracking-wider">
              CONNECT_WALLET // START_EARNING // BECOME_LEGEND
            </p>
            <Link to="/developer">
              <Button className="bg-green-400 text-black hover:bg-cyan-400 font-mono text-lg px-8 py-4 tracking-wider border-2 border-green-400 hover:border-cyan-400">
                &gt; UPLOAD_YOUR_GAME
              </Button>
            </Link>
          </div>
        </section>

        <div className="mt-16 text-center">
              <Card className="game-card p-8 ">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4 neon-text">
                  READY TO DOMINATE?
                </h3>
                <p className="text-green-400 mb-6">
                  Join thousands of players competing for glory and rewards
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge 
                  onClick={() => navigate('/tournaments')}
                  className="bg-green-400 text-black px-4 py-2 cursor-pointer">
                    🏆 Tournaments
                  </Badge>
                  <Badge className="bg-cyan-400 text-black px-4 py-2 cursor-pointer">
                    💰 Rewards
                  </Badge>
                  <Badge
                  onClick={() => navigate('/leaderboard')}
                   className="bg-yellow-400 text-black px-4 py-2 cursor-pointer">
                    📈 Leaderboards
                  </Badge>
                </div>
              </Card>
            </div>
      </div>
  );
};

export default Index;
