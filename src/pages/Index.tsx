import Layout from "../components/Layout";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import GameCard from '../components/GameCard';
import WelcomeModal from '../components/WelcomeModal';
import HowToPlay from '../components/HowToPlay';
import { GamepadIcon, Users, Search, X, Star } from 'lucide-react';
import useWalletStore from '../stores/useWalletStore';
import useProfileStore from '../stores/useProfileStore';
import { Input } from '../components/ui/input';

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


const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useWalletStore();
  const { role } = useProfileStore();
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
      id: "tetris",
      title: "Tetris",
      description: "Classic block-stacking puzzle game",
      image: "/tetris.jpeg",
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
      image: "/snake.jpeg",
      status: "live" as const,
      category: "arcade",
      players: 5234,
      rating: 4.5,
      prize: "75 NERO",
      lastUpdated: '2023-07-01'
    },
    {
      id: "pacman",
      title: "Pac-Man",
      description: "Classic maze chase arcade game",
      image: "/pacman.jpeg",
      status: "live" as const,
      category: "arcade",
      players: 12500,
      rating: 4.8,
      prize: "200 NERO",
      lastUpdated: '2024-07-07'
    }
  ], []);

  const categories = useMemo(() => [
    'all',
    ...Array.from(new Set(allGames.map(game => game.category)))
  ], [allGames]);

  const stats = useMemo(() => [
    {
      title: "ACTIVE PLAYERS",
      value: "112",
      change: "+8 this week",
      icon: Users,
      trend: "up" as const
    },
    {
      title: "TOTAL PRIZES",
      value: "5,000 NERO",
      change: "+500 this week",
      icon: Star,
      trend: "up" as const
    },
    {
      title: "GAMES AVAILABLE",
      value: "3",
      change: "+1 new this week",
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

  // Redirect based on user role
  console.log('Current user role:', role);
  
  // Check if we have a valid role before redirecting
  if (role) {
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    if (role === 'sponsor') {
      return <Navigate to="/sponsor/dashboard" replace />;
    }
    
    if (role === 'developer') {
      return <Navigate to="/developer/dashboard" replace />;
    }
  }

  // Default view for gamers and unauthenticated users
  return (
    <Layout>
      <WelcomeModal />
      <HowToPlay />
      <main className="overflow-hidden min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-4 sm:py-6 md:py-8 min-h-[calc(100vh-4rem)]">
          {/* Welcoming Header */}
          <div className="text-center mb-4 md:mb-6 lg:mb-8 flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-300 via-cyan-300 to-white bg-clip-text text-transparent mb-2 drop-shadow-lg px-4">
              Welcome to ArcadeHub
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-purple-200 font-medium mb-2 md:mb-3 px-4">
              Enjoy classic games with a modern twist!
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-800/40 text-cyan-200 text-xs font-mono tracking-widest uppercase">
              More games coming soon
            </span>
          </div>

          {/* Hero Game Cards - Mobile Optimized */}
          <div className="w-full max-w-6xl flex-1 flex items-center justify-center">
            {/* Mobile Layout: Single column with compact cards */}
            <div className="block md:hidden space-y-3 w-full max-w-sm">
              {allGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-900/80 rounded-xl shadow-xl border border-purple-800/40 hover:border-cyan-400/50 transition-all duration-300 w-full overflow-hidden relative"
                >
                  <div className="flex">
                    {/* Image Section - Smaller on mobile */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover rounded-l-xl"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between min-h-20 sm:min-h-24">
                      <div className="flex-1">
                        <h2 className="text-sm sm:text-base font-bold text-purple-100 mb-1">{game.title}</h2>
                        <p className="text-purple-300 text-xs mb-1.5 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.2em',
                          maxHeight: '2.4em'
                        }}>
                          {game.description}
                        </p>
                        
                        {/* Stats - Compact */}
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          <span className="bg-cyan-800/60 text-cyan-200 px-1.5 py-0.5 rounded-full text-xs">
                            {(game.players / 1000).toFixed(1)}k
                          </span>
                          <span className="bg-purple-800/60 text-purple-200 px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" /> {game.rating}
                          </span>
                        </div>
                      </div>
                      
                      {/* Play Button - Always visible and properly sized */}
                      <button
                        onClick={() => {
                          if (isConnected) {
                            navigate(`/games/${game.id}`);
                          } else {
                            window.dispatchEvent(new Event('openWalletModal'));
                          }
                        }}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-xs shadow-lg hover:from-cyan-500 hover:to-purple-500 transition-all duration-200 flex-shrink-0"
                      >
                        {isConnected ? 'Play Now' : 'Connect'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className="absolute top-1 right-1 bg-green-600/90 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
                    LIVE
                  </span>
                  
                  {/* Prize Badge */}
                  <span className="absolute bottom-1 right-1 bg-gradient-to-r from-yellow-500/90 to-orange-400/90 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow">
                    {game.prize}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop Layout: Side by side cards */}
            <div className="hidden md:flex gap-4 lg:gap-6 items-center justify-center flex-wrap">
              {allGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-900/80 rounded-2xl shadow-xl border border-purple-800/40 hover:border-cyan-400/50 transition-all duration-300 w-full max-w-xs flex flex-col items-center group relative overflow-hidden"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-40 lg:h-48 object-cover object-center rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4 lg:p-5 flex flex-col items-center w-full">
                    <h2 className="text-lg lg:text-xl font-bold text-purple-100 mb-2 drop-shadow-md text-center">
                      {game.title}
                    </h2>
                    <p className="text-purple-300 text-center mb-3 text-sm">
                      {game.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                      <span className="bg-cyan-800/60 text-cyan-200 px-2 py-1 rounded-full text-xs font-mono">
                        {game.players.toLocaleString()} players
                      </span>
                      <span className="bg-purple-800/60 text-purple-200 px-2 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" /> {game.rating}
                      </span>
                      <span className="bg-gradient-to-r from-yellow-500/80 to-orange-400/80 text-white px-2 py-1 rounded-full text-xs font-mono font-bold shadow">
                        {game.prize}
                      </span>
                    </div>
                    
                    {/* Play Button */}
                    <button
                      onClick={() => {
                        if (isConnected) {
                          navigate(`/games/${game.id}`);
                        } else {
                          window.dispatchEvent(new Event('openWalletModal'));
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm shadow-lg hover:from-cyan-500 hover:to-purple-500 hover:scale-105 transition-all duration-200"
                    >
                      {isConnected ? 'Play Now' : 'Connect Wallet'}
                    </button>
                  </div>
                  
                  {/* Status Badge */}
                  <span className="absolute top-3 right-3 bg-green-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    LIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Index;
