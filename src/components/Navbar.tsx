import { useState, useEffect } from 'react';
import { User, LogOut, Wallet, Menu, X } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useWalletStore } from '../stores/useWalletStore';
import { Link } from 'react-router-dom';
import OnboardingModal from './onboarding/Onboarding';
import supabase from '../hooks/use-supabase';
import useProfileStore from '../stores/useProfileStore';


const Navbar = () => {
  const { 
    isInitialized,
    isConnected, 
    address,
    aaWalletAddress,
    initializeWeb3Auth, 
    connectWallet, 
    disconnectWallet 
  } = useWalletStore();

   const [showOnboarding, setShowOnboarding] = useState(false);

   useEffect(() => {
  if (isConnected && address) {
    console.log('Fetching profile for address:', address);
    useProfileStore.getState().fetchProfile(address);
  }
}, [isConnected, address]);

    useEffect(() => {
    if (isConnected) {
      // Check if user profile exists in Supabase
      const checkProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('wallet_address', address)
          .single();
        if (!data) setShowOnboarding(true);
      };
      if (address) checkProfile();
    }
  }, [isConnected, address]);

  const handleOnboardingComplete = async (userData: any) => {
    // Save onboarding data to Supabase
    await supabase.from('profiles').insert([
      {
        wallet_address: address,
        ...userData,
      },
    ]);
    setShowOnboarding(false);
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
  }, []);

  useEffect(() => {
    if (isConnected && !aaWalletAddress) {
      connectWallet();
    }
  }, [isConnected]);


  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navigationItems = [
    { name: 'Games', href: '/', public: true },
  ];

  return (
    <>
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <Link to="/" className="ml-2 text-xl font-bold text-gray-900">ArcadeHub</Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems
                .filter(item => item.public || isConnected)
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            ) : (
              <UserDropdown
                wallet={{
                  address: address || '',
                  // abstractedAddress: aaWalletAddress || '',
                  isConnected: isConnected
                }}
                onDisconnect={handleDisconnect}
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
                <Link
             to='/'
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
              Games
             </Link>
              {navigationItems
                .filter(item => item.public || isConnected)
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                ) : (
                  <div className="space-y-2">
                    {isConnected && (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Connected Addresses</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 font-mono">AA Address:</p>
                        <p className="text-xs text-gray-500 font-mono">{aaWalletAddress || 'Not available'}</p>
                      </div>
                    </div>
                    </div>
                    )}
                   
                    <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md">
                      <User className="inline h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 rounded-md cursor-pointer"
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
    <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default Navbar;
