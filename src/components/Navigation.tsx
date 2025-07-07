import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User as UserIcon, Settings, Search, Gift, Wallet } from 'lucide-react';
import { Input } from './ui/input';
import { UserMenu } from './UserMenu';
import useWalletStore from '../stores/useWalletStore';
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

const getNavLinks = (userProfile: User | null | undefined, isConnected: boolean): NavLink[] => {
  const baseLinks: NavLink[] = [
    { to: '/', icon: Home, label: 'Home', exact: true },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', exact: false },
    { to: '/tournaments', icon: Trophy, label: 'Tournaments', exact: false },

  ];
  if (isConnected) {
    baseLinks.push({ to: '/wallet', icon: Wallet, label: 'Wallet', exact: false });
  }
  if (!userProfile) return baseLinks;

  // Always show profile for logged-in users
  baseLinks.push({ to: '/profile', icon: UserIcon, label: 'Profile', exact: false });

  switch (userProfile.user_type) {
    case 'developer':
      baseLinks.push({ to: '/developer', icon: Gamepad2, label: 'Developer', exact: false });
      break;
    case 'sponsor':
      baseLinks.push({ to: '/sponsor/dashboard', icon: Gift, label: 'Sponsor', exact: false });
      baseLinks.push({ to: '/sponsor/create-tournament', icon: Trophy, label: 'Create Tournament', exact: false });
      break;
    case 'admin':
      baseLinks.push({ to: '/admin', icon: Settings, label: 'Admin', exact: false });
      break;
    // Add more user types as needed
  }
  return baseLinks;
};

const Navigation: React.FC<NavigationProps> = ({ userProfile }) => {
  const location = useLocation();
  const { isConnected } = useWalletStore();

  const navLinks = getNavLinks(userProfile, isConnected);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ArcadeHUb
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
                  className={`px-3 py-2 text-sm font-medium rounded-md ${location.pathname === link.to
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

            {/* Mobile Search - Simple search icon that could expand */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>


        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-40 safe-area-pb">
        <div className="flex justify-around items-center px-2 py-2">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${location.pathname === link.to
                ? 'text-cyan-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{link.label}</span>
            </Link>
          ))}
          
          {/* User Menu in Bottom Navigation */}
          <div className="flex flex-col items-center justify-center py-2 px-3">
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed header and bottom navigation */}
      <div className="h-16" />
      <div className="md:hidden h-16" /> {/* Extra padding for mobile bottom nav */}
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom);
          }
          @media (max-width: 768px) {
            body {
              padding-bottom: calc(4rem + env(safe-area-inset-bottom));
            }
          }
        `}
      </style>
    </>
  );
};

export default Navigation;
