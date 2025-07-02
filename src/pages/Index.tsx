import Layout from "../components/Layout";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import GameCard from '../components/GameCard';
import WelcomeModal from '../components/WelcomeModal';
import HowToPlay from '../components/HowToPlay';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GamepadIcon, Users, Wallet as WalletIcon, Search, X, Star } from 'lucide-react';
import useWalletStore from '../stores/useWalletStore';
import { Input } from '../components/ui/input';
import Tooltip from '../components/Tooltip';

type GameStatus = 'live' | 'upcoming' | 'completed' | 'beta';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  status: GameStatus;
  category: string;
  players: number;
  rating: number;
  prize: string;
  lastUpdated: string;
}

const TOKEN_ABI = "../abi/ArcadeToken.json";

const Index = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWalletStore();
  const [showWalletTooltip, setShowWalletTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const hasSeenWalletTooltip = localStorage.getItem('hasSeenWalletTooltip');
    if (!hasSeenWalletTooltip && isConnected === false) {
      const timer = setTimeout(() => {
        setShowWalletTooltip(true);
        setTimeout(() => setShowWalletTooltip(false), 5000);
        localStorage.setItem('hasSeenWalletTooltip', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const allGames: Game[] = useMemo(() => [
    {
      id: "honey-clicker",
      title: "Honey Clicker",
      description: "Click to collect honey and grow your hive!",
      image: "/honey-clicker.jpg",
      status: "live" as const,
      category: "idle",
      players: 12453,
      rating: 4.8,
      prize: "100 NERO",
      lastUpdated: '2023-06-15'
    },
    {
      id: "tetris",
      title: "Tetris",
      description: "Classic block-stacking puzzle game",
      image: "/tetris.jpg",
      status: "live" as const,
      category: "puzzle",
      players: 8976,
      rating: 4.9,
      prize: "150 NERO",
      lastUpdated: '2023-06-20'
    },
    {
      id: "snake",
      title: "Snake",
      description: "Classic snake game with a modern twist",
      image: "/snake.jpg",
      status: "live" as const,
      category: "arcade",
      players: 5234,
      rating: 4.5,
      prize: "75 NERO",
      lastUpdated: '2023-07-01'
    }
  ], []);

  const categories = useMemo(() => [
    'all',
    ...Array.from(new Set(allGames.map(game => game.category)))
  ], [allGames]);

  const stats = useMemo(() => [
    {
      title: "ACTIVE PLAYERS",
      value: "47,892",
      change: "+12.5% from last week",
      icon: Users,
      trend: "up" as const
    },
    {
      title: "TOTAL PRIZES",
      value: "1,250,000 NERO",
      change: "+8.2% from last week",
      icon: Star,
      trend: "up" as const
    },
    {
      title: "GAMES AVAILABLE",
      value: "24",
      change: "+2 new this week",
      icon: GamepadIcon,
      trend: "up" as const
    }
  ], []);

  const filteredGames = useMemo(() => {
    let result = [...allGames];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      result = result.filter(game => game.category === category);
    }

    // Filter by status
    const status = searchParams.get('status') as GameStatus | null;
    if (status) {
      result = result.filter(game => game.status === status);
    } else {
      // By default, only show live games
      result = result.filter(game => game.status === 'live');
    }

    return result;
  }, [allGames, searchQuery, searchParams]);

  const sortedGames = useMemo(() => {
    const games = [...filteredGames];

    switch (sortBy) {
      case 'popularity':
        return [...games].sort((a, b) => b.players - a.players);
      case 'rating':
        return [...games].sort((a, b) => b.rating - a.rating);
      case 'prize':
        return [...games].sort((a, b) => {
          const prizeA = parseFloat(a.prize);
          const prizeB = parseFloat(b.prize);
          return isNaN(prizeA) || isNaN(prizeB) ? 0 : prizeB - prizeA;
        });
      case 'newest':
        return [...games].sort((a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      default:
        return games;
    }
  }, [filteredGames, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate(`?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    navigate(`?${params.toString()}`);
  };

  const hasActiveFilters = useMemo(() => {
    return searchQuery ||
      searchParams.get('category') ||
      searchParams.get('status') ||
      sortBy !== 'popularity';
  }, [searchQuery, searchParams, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('popularity');
    navigate('?');
  };

  return (
    <Layout>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern">
        <Navigation />
        <WelcomeModal />
        <HowToPlay />
        <Breadcrumbs />

        {/* <div className="container mx-auto px-4 pt-6 pb-2 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/tournaments')}
            className="group relative px-6 py-3 font-medium text-black bg-gradient-to-r from-green-400 to-emerald-300 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🏆</span>
              <span>Tournaments</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            className="group relative px-6 py-3 font-medium text-black bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">💰</span>
              <span>Rewards</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="group relative px-6 py-3 font-medium text-black bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">📈</span>
              <span>Leaderboards</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div> */}

        <main className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full bg-gray-800 border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-md border border-purple-700 bg-gray-800 text-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="popularity">Sort by: Most Popular</option>
                <option value="rating">Sort by: Highest Rated</option>
                <option value="prize">Sort by: Highest Prize</option>
                <option value="newest">Sort by: Newest</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!searchParams.get('category')
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-purple-200 hover:bg-gray-700 hover:text-white border border-purple-700/50 hover:border-purple-500'
                  }`}
              >
                All Games
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${searchParams.get('category') === category
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-800 text-red-200 hover:bg-gray-700 hover:text-white border border-red-700/50 hover:border-red-500'
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}

              <div className="ml-2 flex items-center gap-2">
                <span className="text-sm font-medium text-purple-200">Status:</span>
                <button
                  onClick={() => handleStatusFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${!searchParams.get('status')
                    ? 'bg-purple-600 text-white font-medium shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800 text-purple-200 hover:bg-gray-700 hover:text-white border border-purple-700/50 hover:border-purple-500'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilter('live')}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${searchParams.get('status') === 'live'
                    ? 'bg-green-500 text-black font-medium shadow-lg shadow-green-500/30'
                    : 'bg-gray-800 text-green-300 hover:bg-gray-700 hover:text-white border border-green-700/50 hover:border-green-500'
                    }`}
                >
                  Live
                </button>
                <button
                  onClick={() => handleStatusFilter('upcoming')}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${searchParams.get('status') === 'upcoming'
                    ? 'bg-yellow-500 text-black font-medium shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-800 text-yellow-300 hover:bg-gray-700 hover:text-white border border-yellow-700/50 hover:border-yellow-500'
                    }`}
                >
                  Coming Soon
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center text-sm text-purple-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-full border border-purple-700/50 hover:border-purple-500 transition-all duration-200"
                >
                  <X size={16} className="mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 border-b-2 border-purple-500/30 mb-8 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                      {/* {stat.icon} */}
                    </div>
                    <div>
                      <p className="text-sm text-purple-200 font-mono">{stat.title}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Games Grid */}
          {sortedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedGames.map((game) => (
                <div
                  key={game.id}
                  className="transform transition-all duration-300 hover:scale-105 hover:z-10"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-900/50 rounded-xl border-2 border-dashed border-purple-900/50">
              <div className="inline-block p-4 bg-gray-800/80 rounded-full mb-4">
                <Search className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-purple-100 mb-2">No Games Found</h3>
              <p className="text-purple-300 mb-4 max-w-md mx-auto">We couldn't find any games matching your search criteria.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

    </Layout>
  );
};

export default Index;
