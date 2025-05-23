
import React, { useState } from 'react';
import { ChevronDown, User, Settings, LogOut, Wallet, Menu, X } from 'lucide-react';
import UserDropdown from './UserDropdown';

interface WalletInfo {
  address: string;
  abstractedAddress: string;
  isConnected: boolean;
}

const Navbar = () => {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    abstractedAddress: '',
    isConnected: false
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock wallet connection
  const connectWallet = async () => {
    // Simulating wallet connection
    setWallet({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      abstractedAddress: '0x5678901234567890abcdef1234567890abcdef56',
      isConnected: true
    });
  };

  const disconnectWallet = () => {
    setWallet({
      address: '',
      abstractedAddress: '',
      isConnected: false
    });
    setIsDropdownOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navigationItems = [
    { name: 'Home', href: '#', public: true },
    { name: 'About', href: '#', public: true },
    { name: 'Dashboard', href: '#', public: false },
    { name: 'Transactions', href: '#', public: false },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WalletApp</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems
              .filter(item => item.public || wallet.isConnected)
              .map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            {!wallet.isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            ) : (
              <UserDropdown
                wallet={wallet}
                onDisconnect={disconnectWallet}
                truncateAddress={truncateAddress}
              />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems
                .filter(item => item.public || wallet.isConnected)
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {!wallet.isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Wallet Address</p>
                      <p className="text-xs text-gray-600 font-mono">{truncateAddress(wallet.address)}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">AA: {truncateAddress(wallet.abstractedAddress)}</p>
                    </div>
                    <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md">
                      <User className="inline h-4 w-4 mr-2" />
                      Profile
                    </a>
                    <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md">
                      <Settings className="inline h-4 w-4 mr-2" />
                      Settings
                    </a>
                    <button
                      onClick={disconnectWallet}
                      className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 rounded-md"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
