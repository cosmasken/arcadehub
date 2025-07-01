import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, Settings, Search } from 'lucide-react';
import { Input } from './ui/input';
import { useWalletStore } from '../stores/useWalletStore';

const Navigation = () => {
  const location = useLocation();
  const { isConnected } = useWalletStore();

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/games', icon: Gamepad2, label: 'All Games' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'action', name: 'Action' },
    { id: 'puzzle', name: 'Puzzle' },
    { id: 'arcade', name: 'Arcade' },
    { id: 'strategy', name: 'Strategy' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                RetroArcade
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === link.to
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <link.icon className="h-5 w-5 mr-2" />
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-4 py-2 overflow-x-auto hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1 text-sm font-medium whitespace-nowrap rounded-full ${
                  location.search.includes(`category=${category.id}`)
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => {
                  // Handle category filter
                  const searchParams = new URLSearchParams(location.search);
                  if (category.id === 'all') {
                    searchParams.delete('category');
                  } else {
                    searchParams.set('category', category.id);
                  }
                  window.location.search = searchParams.toString();
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 z-40">
        <div className="flex justify-around">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center py-3 px-4 ${
                location.pathname === link.to
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Add padding to account for fixed header */}
      <div className="h-24 md:h-20" />
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
};

export default Navigation;
