import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User as UserIcon, Settings, Search, Gift, Wallet, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { UserMenu } from './UserMenu';
import { useWalletStore } from '../stores/useWalletStore';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { Button } from './ui/button';

import type { User } from '../types/supabase';

interface NavLink {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact: boolean;
}

interface NavigationProps {
  userProfile?: User | null;
}

const Navigation: React.FC<NavigationProps> = ({ userProfile }) => {
  const location = useLocation();
  const { isConnected } = useWalletStore();

  const navLinks: NavLink[] = [
    { to: '/', icon: Home, label: 'Home', exact: true },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', exact: false },
  ];

  // Add Wallet link if user is connected
  if (isConnected) {
    navLinks.push({ to: '/wallet', icon: Wallet, label: 'Wallet', exact: false });
  }

  if (userProfile) {
    navLinks.push({ to: '/profile', icon: UserIcon, label: 'Profile', exact: false });
    if (userProfile.user_type === 'developer') {
      navLinks.push({ to: '/developer', icon: Gamepad2, label: 'Developer', exact: false });
    } else if (userProfile.user_type === 'sponsor') {
      navLinks.push({ to: '/sponsor/dashboard', icon: Gift, label: 'Sponsor', exact: false });
      navLinks.push({ to: '/sponsor/create-tournament', icon: Trophy, label: 'Create Tournament', exact: false });
    } else if (userProfile.user_type === 'admin') {
      navLinks.push({ to: '/admin', icon: Settings, label: 'Admin', exact: false });
    }
  }

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

            {/* Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop Navigation Links and User Menu */}
            <div className="hidden md:flex items-center space-x-4">
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
              <div className="flex items-center">
                <UserMenu />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-gray-900 border-l border-gray-800 p-4">
                  <div className="flex flex-col items-center space-y-6 mt-8">
                    {/* Search Bar (Mobile) */}
                    <div className="w-full relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search games..."
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex flex-col space-y-2 w-full">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.to}>
                          <Link
                            to={link.to}
                            className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                              location.pathname === link.to
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <link.icon className="h-5 w-5 mr-3" />
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>

                    {/* Categories (Mobile) */}
                    <div className="flex flex-wrap justify-center gap-2 w-full">
                      {categories.map((category) => (
                        <SheetClose asChild key={category.id}>
                          <button
                            className={`px-3 py-1 text-sm font-medium whitespace-nowrap rounded-full ${
                              location.search.includes(`category=${category.id}`)
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            onClick={() => {
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
                        </SheetClose>
                      ))}
                    </div>

                    {/* User Menu (Mobile) */}
                    <div className="w-full flex justify-center">
                      <UserMenu />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Categories (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 py-2 overflow-x-auto hide-scrollbar">
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
          <UserMenu />
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
