import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, LogOut, Copy, Check, Trophy, Gift, Layers, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';

interface WalletInfo {
  address: string;
  isConnected: boolean;
}

interface UserDropdownProps {
  wallet: WalletInfo;
  onDisconnect: () => void;
  truncateAddress: (address: string) => string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  wallet,
  onDisconnect,
  truncateAddress
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { role } = useProfileStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Dynamic menu items based on role
  const menuItems = role === 'developer'
    ? [
        {
          to: '/developers',
          label: 'Developer Dashboard',
          icon: <Code className="h-4 w-4 mr-3 text-gray-500" />,
        },
        {
          to: '/profile',
          label: 'Profile',
          icon: <User className="h-4 w-4 mr-3 text-gray-500" />,
        },
        {
          to: '#',
          label: 'Settings',
          icon: <Settings className="h-4 w-4 mr-3 text-gray-500" />,
        },
      ]
    : [
        {
          to: '/profile',
          label: 'Profile',
          icon: <User className="h-4 w-4 mr-3 text-gray-500" />,
        },
        {
          to: '/rewards',
          label: 'Rewards',
          icon: <Gift className="h-4 w-4 mr-3 text-gray-500" />,
        },
        {
          to: '/collections',
          label: 'Collections',
          icon: <Layers className="h-4 w-4 mr-3 text-gray-500" />,
        },
        {
          to: '#',
          label: 'Settings',
          icon: <Settings className="h-4 w-4 mr-3 text-gray-500" />,
        },
      ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium font-mono">
          {truncateAddress(wallet.address)}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Wallet Addresses Section */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Connected Wallets</h3>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Address</span>
                <button
                  onClick={() => copyToClipboard(wallet.address, 'wallet')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedAddress === 'wallet' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded mt-1 break-all">
                {wallet.address}
              </p>
            </div>
          </div>

          {/* Dynamic Menu Items */}
          <div className="py-1">
            {menuItems.map((item, idx) =>
              item.to === '#' ? (
                <button
                  key={item.label}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  // Add your settings modal logic here
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            )}
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={onDisconnect}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;