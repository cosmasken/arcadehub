import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, Wallet, User, Settings, ChevronDown, Copy, Check } from 'lucide-react';

import { useWalletStore } from '../stores/useWalletStore';
// import OnboardingModal from './onboarding/Onboarding';
import supabase from '../hooks/use-supabase';
import useProfileStore from '../stores/useProfileStore';
import OnboardingModal from './OnboardingModal';



const Header = () => {
  // const { user, isLoading, login, logout } = useWeb3();
  const {
    isInitialized,
    isConnected,
    aaWalletAddress,
    initializeWeb3Auth,
    connectWallet,
    disconnectWallet
  } = useWalletStore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const { role } = useProfileStore();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);


  useEffect(() => {
    if (isConnected && aaWalletAddress) {
      console.log('Fetching profile for aaWalletAddress:', aaWalletAddress);
      useProfileStore.getState().fetchProfile(aaWalletAddress);
    }
  }, [isConnected, aaWalletAddress]);

  useEffect(() => {
    if (isConnected) {
      // Check if user profile exists in Supabase
      const checkProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('wallet_address', aaWalletAddress)
          .single();
        if (!data) setShowOnboarding(true);
      };
      if (aaWalletAddress) checkProfile();
    }
  }, [isConnected, aaWalletAddress]);

  const handleOnboardingComplete = async (userData: any) => {
    // Save onboarding data to Supabase
    await supabase.from('profiles').insert([
      {
        wallet_address: aaWalletAddress,
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

  const truncateAddress = (aaWalletAddress: string) => {
    return `${aaWalletAddress.slice(0, 6)}...${aaWalletAddress.slice(-4)}`;
  };

  const copyToClipboard = async (aaWalletAddress: string, type: string) => {
    try {
      await navigator.clipboard.writeText(aaWalletAddress);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };


  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-black border-b-2 border-cyan-400">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/">
                <h1 className="text-sm sm:text-lg md:text-xl text-cyan-400 tracking-wider font-bold font-mono hover:text-green-400 transition-colors">
                  &gt; NERO_ARCADE &lt;
                </h1>
              </Link>
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-green-400 hover:text-cyan-400 transition-colors font-mono tracking-wider text-xs uppercase border-b-2 border-transparent hover:border-cyan-400 pb-1"
                >
                  &gt; GAMES
                </Link>

                <Link
                  to="/admin"
                  className="text-green-400 hover:text-cyan-400 transition-colors font-mono tracking-wider text-xs uppercase border-b-2 border-transparent hover:border-cyan-400 pb-1"
                >
                  &gt; ADMIN
                </Link>

                 <Link
                  to="/sponsors"
                  className="text-green-400 hover:text-cyan-400 transition-colors font-mono tracking-wider text-xs uppercase border-b-2 border-transparent hover:border-cyan-400 pb-1"
                >
                  &gt; SPONSORS
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-black border-2 border-green-400 px-4 py-2">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-mono tracking-wider text-green-400">CONNECTED</span>
                    {/* Address with copy icon */}
                    {aaWalletAddress && (
                      <span className="flex items-center ml-2">
                        <span className="font-mono text-xs text-cyan-400">{truncateAddress(aaWalletAddress)}</span>
                        <button
                          onClick={() => copyToClipboard(aaWalletAddress, 'wallet')}
                          className="ml-1 text-cyan-400 hover:text-green-400"
                          title={copiedAddress === 'wallet' ? "Copied!" : "Copy address"}
                        >
                          {copiedAddress === 'wallet' ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </span>
                    )}
                  </div>



                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 text-cyan-400 hover:text-green-400 border border-transparent hover:border-cyan-400 p-2"
                      >
                        <Avatar className="w-8 h-8 border-2 border-cyan-400">
                          {/* <AvatarImage src={user.profileImage} alt={user.name} /> */}
                          <AvatarFallback className="bg-black text-cyan-400">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-mono tracking-wider">
                          {aaWalletAddress ? truncateAddress(aaWalletAddress) : null}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-black border-2 border-cyan-400 text-green-400 font-mono"
                      align="end"
                    >
                      {/* Role-based items */}
                      {role === 'gamer' ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <Settings className="w-4 h-4" />
                              <span>&gt; MY ACHIEVEMNTS</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; GAMES</span>
                            </Link>



                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/collections"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; COLLECTIONS</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/leaderboard"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; lEADERBOARD</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/tournaments"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; TOURNAMENTS</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/developer-profile"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; DEV DASHBOARD</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/upload"
                              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                            >
                              <span>&gt; UPLOAD GAME</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400">
                        <Settings className="w-4 h-4" />
                        <span>&gt; SETTINGS</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-cyan-400" />
                      <DropdownMenuItem
                        onClick={handleDisconnect}
                        className="flex items-center space-x-2 cursor-pointer hover:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>&gt; LOGOUT</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  onClick={handleConnect}
                  className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs tracking-wider border-2 border-cyan-400 hover:border-green-400"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  &gt; CONNECT_WALLET
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

    </>
  );
};

export default Header;
