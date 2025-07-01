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
import { useWalletStore } from '../stores/useWalletStore';
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
      description: "Classic snake game with a twist",
      image: "/snake.jpg",
      status: "upcoming" as const,
      category: "arcade",
      players: 0,
      rating: 0,
      prize: "75 NERO",
      lastUpdated: '2023-07-01'
    },
    {
      id: "pong",
      title: "Pong",
      description: "Classic arcade pong game",
      image: "/pong.jpg",
      status: "live" as const,
      category: "arcade",
      players: 7564,
      rating: 4.7,
      prize: "80 NERO",
      lastUpdated: '2023-06-25'
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
    
    switch(sortBy) {
      case 'popularity':
        return games.sort((a, b) => b.players - a.players);
      case 'rating':
        return games.sort((a, b) => b.rating - a.rating);
      case 'prize':
        return games.sort((a, b) => {
          const prizeA = parseFloat(a.prize);
          const prizeB = parseFloat(b.prize);
          return isNaN(prizeA) || isNaN(prizeB) ? 0 : prizeB - prizeA;
        });
      case 'newest':
        return games.sort((a, b) => 
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <WelcomeModal />
      <HowToPlay />
      <Breadcrumbs />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-full"
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
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                !searchParams.get('category')
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Games
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  searchParams.get('category') === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
            
            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <button
                onClick={() => handleStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  !searchParams.get('status')
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('live')}
                className={`px-3 py-1 text-sm rounded-full ${
                  searchParams.get('status') === 'live'
                    ? 'bg-green-500 text-black font-medium'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => handleStatusFilter('upcoming')}
                className={`px-3 py-1 text-sm rounded-full ${
                  searchParams.get('status') === 'upcoming'
                    ? 'bg-yellow-500 text-black font-medium'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Coming Soon
              </button>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center text-sm text-gray-400 hover:text-white"
              >
                <X size={16} className="mr-1" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-gray-900/50 border-b border-gray-800 mb-8">
          <div className="container mx-auto px-6 py-3">
            <div className="flex flex-wrap justify-center items-center gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center">
                  <stat.icon className="w-5 h-5 text-purple-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-400">{stat.title}</div>
                    <div className="font-bold text-lg text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.change}</div>
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

        {/* Games Grid */}
        {sortedGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No games found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-0 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
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
      </main>
    </div>
  );
};

export default Index;
