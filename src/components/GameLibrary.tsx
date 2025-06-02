
import React, { useState } from 'react';
import { Play, Star, Users } from 'lucide-react';
import { Game } from '../pages/Index';

interface GameLibraryProps {
  onGameSelect: (game: Game) => void;
}

const mockGames: Game[] = [
  {
    id: '1',
    title: 'Honey Clicker',
    thumbnail: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400&h=300&fit=crop',
    category: 'Clicker',
    description: 'Click to collect honey and build your beekeeping empire! Buy upgrades, unlock achievements, and become the ultimate honey tycoon.',
    rating: 4.8,
    plays: '3.5M'
  },
  {
    id: '2',
    title: 'Bubble Shooter Deluxe',
    thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
    category: 'Puzzle',
    description: 'Classic bubble shooting game with colorful graphics',
    rating: 4.5,
    plays: '2.1M'
  },
  {
    id: '3',
    title: 'Racing Thunder',
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
    category: 'Racing',
    description: 'High-speed racing with stunning visuals',
    rating: 4.7,
    plays: '1.8M'
  },
  {
    id: '4',
    title: 'Space Adventure',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    category: 'Action',
    description: 'Epic space exploration and combat',
    rating: 4.3,
    plays: '3.2M'
  },
  {
    id: '5',
    title: 'Code Master',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    category: 'Educational',
    description: 'Learn programming while having fun',
    rating: 4.6,
    plays: '950K'
  },
  {
    id: '6',
    title: 'Matrix Runner',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    category: 'Action',
    description: 'Navigate through the digital matrix',
    rating: 4.4,
    plays: '1.5M'
  },
  {
    id: '7',
    title: 'Virtual Office',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    category: 'Simulation',
    description: 'Manage your virtual workplace',
    rating: 4.2,
    plays: '800K'
  },
  {
    id: '8',
    title: 'Robot Factory',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    category: 'Strategy',
    description: 'Build and manage robot production',
    rating: 4.8,
    plays: '2.7M'
  }
];

const categories = ['All', 'Action', 'Puzzle', 'Racing', 'Strategy', 'Educational', 'Simulation', 'Clicker'];

export const GameLibrary = ({ onGameSelect }: GameLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredGames = selectedCategory === 'All' 
    ? mockGames 
    : mockGames.filter(game => game.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-cyan-400">GameVerse</span>
        </h2>
        <p className="text-xl text-white/80 mb-8">
          Discover thousands of free games and start playing instantly!
        </p>
      </div>

      {/* Featured Game */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white mb-6 md:mb-0">
            <h3 className="text-3xl font-bold mb-4">Featured: Honey Clicker</h3>
            <p className="text-lg mb-6">The sweetest clicker game! Build your beekeeping empire, collect honey, and unlock amazing achievements!</p>
            <button 
              onClick={() => onGameSelect(mockGames[0])}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Play Now</span>
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src={mockGames[0].thumbnail} 
              alt="Featured Game" 
              className="rounded-lg shadow-2xl w-64 h-48 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === category
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group border border-white/20"
            onClick={() => onGameSelect(game)}
          >
            <div className="relative">
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                {game.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2 truncate">{game.title}</h3>
              <p className="text-white/70 text-sm mb-3 line-clamp-2">{game.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">{game.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm">{game.plays}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
