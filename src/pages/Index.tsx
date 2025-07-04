import Layout from "../components/Layout";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
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
      value: "2",
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
      <Navigation />
      <main className="overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Welcoming Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-cyan-300 to-white bg-clip-text text-transparent mb-1 drop-shadow-lg">Welcome to ArcadeHub</h1>
            <p className="text-lg text-purple-200 font-medium mb-2">Enjoy classic games with a modern twist!</p>
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-800/40 text-cyan-200 text-xs font-mono tracking-widest uppercase">More games coming soon</span>
          </div>
          {/* Hero Game Cards */}
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl items-center justify-center">
            {allGames.map((game) => (
              <div
                key={game.id}
                className="bg-gray-900/80 rounded-2xl shadow-xl border border-purple-800/40 hover:border-cyan-400/50 transition-all duration-300 max-w-xs w-full flex flex-col items-center group relative overflow-hidden"
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-52 object-cover object-center rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 flex flex-col items-center w-full">
                  <h2 className="text-xl font-bold text-purple-100 mb-1 drop-shadow-md">{game.title}</h2>
                  <p className="text-purple-300 text-center mb-3 text-sm">{game.description}</p>
                  <div className="flex gap-2 mb-3">
                    <span className="bg-cyan-800/60 text-cyan-200 px-2 py-0.5 rounded-full text-xs font-mono">{game.players.toLocaleString()} players</span>
                    <span className="bg-purple-800/60 text-purple-200 px-2 py-0.5 rounded-full text-xs font-mono flex items-center gap-1"><Star className="w-4 h-4 inline-block text-yellow-400" /> {game.rating}</span>
                    <span className="bg-gradient-to-r from-yellow-500/80 to-orange-400/80 text-white px-2 py-0.5 rounded-full text-xs font-mono font-bold shadow">{game.prize}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (isConnected) {
                        navigate(`/games/${game.id}`);
                      } else {
                        // Optionally trigger wallet connect modal here
                        window.dispatchEvent(new Event('openWalletModal'));
                      }
                    }}
                    className="mt-1 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-base shadow-lg hover:from-cyan-500 hover:to-purple-500 hover:scale-105 transition-all duration-200"
                  >
                    {isConnected ? 'Play Now' : 'Connect Wallet'}
                  </button>
                </div>
                <span className="absolute top-3 right-3 bg-green-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">LIVE</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Index;