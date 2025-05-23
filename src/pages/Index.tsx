
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data for games
const gamesData = [
  {
    id: 1, 
    title: 'Star Blaster',
    description: 'Arcade shooter with intense action',
    category: 'Arcade',
    rewards: '1-5 ARC/hr',
    image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 2, 
    title: 'Puzzle Pop',
    description: 'Match-3 puzzle game with colorful challenges',
    category: 'Puzzle',
    rewards: '2-4 ARC/hr',
    image: 'https://images.unsplash.com/photo-1642484865851-111e68695d94?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 3, 
    title: 'Turbo Dash',
    description: 'High-octane racing experience',
    category: 'Racing',
    rewards: '3-7 ARC/hr',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 4, 
    title: 'Clicker Craze',
    description: 'Addictive idle game with upgrades',
    category: 'Idle',
    rewards: '1-3 ARC/hr',
    image: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 5, 
    title: 'Alien Quest',
    description: 'Adventure platformer with alien worlds',
    category: 'Platformer',
    rewards: '2-6 ARC/hr',
    image: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 6, 
    title: 'Crypto Raiders',
    description: 'Blockchain-themed adventure game',
    category: 'Adventure',
    rewards: '3-8 ARC/hr',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 7, 
    title: 'Block Breaker',
    description: 'Classic arcade with a crypto twist',
    category: 'Arcade',
    rewards: '1-4 ARC/hr',
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 8, 
    title: 'Metaverse Miner',
    description: 'Resource gathering and strategy',
    category: 'Strategy',
    rewards: '4-9 ARC/hr',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

const Index = () => {
  const [wallet, setWallet] = useState({ isConnected: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // For demo purposes - this would be controlled by actual wallet connection
  useEffect(() => {
    // Check if there's a wallet connection status in localStorage
    const storedWalletStatus = localStorage.getItem('walletConnected');
    if (storedWalletStatus === 'true') {
      setWallet({ isConnected: true });
    }
  }, []);

  // Filter games based on search term and category
  const filteredGames = gamesData.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || game.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Launch game function
  const launchGame = (gameId) => {
    console.log(`Launching game with ID: ${gameId}`);
    // This would redirect to the game page or launch a modal with the game
  };

  // Get unique categories for filter
  const categories = ['', ...new Set(gamesData.map(game => game.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <Navbar />
      
      {!wallet.isConnected ? (
        // Landing Page for Non-Authenticated Users
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Welcome to ArcadeHub
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
              A cutting-edge Web3 gaming platform blending social accessibility with blockchain innovation
            </p>
            <Button 
              onClick={() => {
                localStorage.setItem('walletConnected', 'true');
                setWallet({ isConnected: true });
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full"
            >
              Get Started
            </Button>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Social Login & AA Wallets</h3>
                <p className="text-blue-200">
                  Sign up with social accounts and get an Account Abstraction wallet automatically created for you.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Gasless Gameplay</h3>
                <p className="text-blue-200">
                  All game interactions and reward claims are gasless, leveraging AA wallets and relayer infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Earn While You Play</h3>
                <p className="text-blue-200">
                  Each game features its own reward structure, allowing users to earn ARC tokens as they progress.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Game Library</h3>
                <p className="text-blue-200">
                  Several HTML5 games are available, from arcade shooters to racing and puzzle games.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Rewards & Achievements</h3>
                <p className="text-blue-200">
                  Track your progress and earn ARC tokens through gameplay, referrals, and achievements.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700/50 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Web3 Integration</h3>
                <p className="text-blue-200">
                  All blockchain interactions handled via ethers.js and smart contracts on the NERO chain.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-6">Updates in This Wave</h2>
            <p className="text-blue-200 mb-4 max-w-3xl mx-auto">
              Note: Claims / Minting are only available if you sign in via wallet (Work in progress, keep checking). 
              All other functions are available via social logins.
            </p>
          </div>
        </div>
      ) : (
        // Game Library for Authenticated Users
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Game Library</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white w-full sm:w-64"
                />
              </div>
              
              {/* Category filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="py-2 px-4 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white"
              >
                <option value="">All Categories</option>
                {categories.filter(cat => cat !== '').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button 
                onClick={() => {
                  localStorage.removeItem('walletConnected');
                  setWallet({ isConnected: false });
                }}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Disconnect (Demo)
              </Button>
            </div>
          </div>
          
          {/* Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                className="bg-blue-800/30 border border-blue-700/50 rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer"
                onClick={() => launchGame(game.id)}
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="object-cover w-full h-48" 
                  />
                  <div className="absolute bottom-0 right-0 bg-purple-600 px-3 py-1 m-2 rounded-full text-sm">
                    {game.rewards}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                  <span className="inline-block bg-blue-700/50 text-blue-200 text-xs px-2 py-1 rounded mb-2">
                    {game.category}
                  </span>
                  <p className="text-blue-200 text-sm">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-blue-300">No games found matching your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
