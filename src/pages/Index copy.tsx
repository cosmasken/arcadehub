import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import useProfileStore from '../stores/useProfileStore';

// Mock data for games
const gamesData = [
  {
    id: 1,
    title: 'Hive Game',
    description: 'Click to collect honey and build your hive',
    category: 'Arcade',
    rewards: '1-500 ARC/Click',
    image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: '/games/hive-game'
  },
  {
    id: 2,
    title: 'Sudoku',
    description: 'Classic Sudoku puzzle game',
    category: 'Puzzle',
    rewards: '2-4 ARC/hr',
    image: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    url: '/games/sudoku'
  }

];

const Index = () => {
    const { 
      isInitialized,
      isConnected, 
      address,
      initializeWeb3Auth, 
    } = useWalletStore();
    

   useEffect(() => {
  if (isConnected && address) {
    console.log('Fetching profile for address:', address);
    useProfileStore.getState().fetchProfile(address);
  }
}, [isConnected, address]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  const launchGame = (gameUrl: string) => {
    navigate(gameUrl);
  };

  
  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized) {
          await initializeWeb3Auth();
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error);
      }
    };
    init();
  }, [initializeWeb3Auth, isInitialized]);

  // Filter games based on search term and category
  const filteredGames = gamesData.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || game.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['', ...new Set(gamesData.map(game => game.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      
      {!isConnected ? (
        // Landing Page for Non-Authenticated Users
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Welcome to ArcadeHub
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
              A cutting-edge Web3 gaming platform blending social accessibility with blockchain innovation
            </p>
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
            </div>
          </div>
          
          {/* Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                className="bg-blue-800/30 border border-blue-700/50 rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer"
                onClick={() => launchGame(game.url)}
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
