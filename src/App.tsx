import React, { useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";

// Hooks & Stores
import useWalletStore from "./stores/useWalletStore";
import useProfileStore from "./stores/useProfileStore";
import { supabase } from "./lib/supabase";

// Types
import type { User } from "./types/supabase";

// UI Components
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { toast } from "./components/ui/use-toast";
import LoadingModal from "./components/LoadingModal";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import OnboardingModal from "./components/OnboardingModal";

// Pages
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";
import Profile from "./pages/Profile";
import DeveloperUpload from "./pages/DeveloperUpload";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import DeveloperProfile from "./pages/DeveloperProfile";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Sponsors from "./pages/Sponsors";
import SponsorLogin from "./pages/SponsorLogin";
import SponsorDashboard from "./pages/SponsorDashboard";
import CreateTournament from "./pages/CreateTournament";
import SponsorAnalytics from "./components/SponsorAnalytics";
import SnakeGame from "./games/snake/SnakeGame";
import Tetris from "./games/tetris";
import WalletPage from "./pages/WalletPage";
import { error } from 'console';

const queryClient = new QueryClient();

// Extend Window interface for development helpers
declare global {
  interface Window {
    forceOnboardingCheck?: () => void;
    showOnboardingModal?: () => void;
  }
}

const App = () => {
  const { aaWalletAddress, initWeb3Auth, isConnected } = useWalletStore();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<User | null>(null);
  const [lastCheckedAddress, setLastCheckedAddress] = React.useState<string | null>(null);

  const initializeAuth = useCallback(async () => {
    try {
      await initWeb3Auth();

    } catch (error) {
      console.error('Auth initialization error:', error);
      throw error;
    }
  }, [initWeb3Auth]);

  const checkUserProfile = useCallback(async (walletAddress: string, forceCheck = false) => {
    try {
      // Skip if we already checked this address recently (unless forced)
      if (!forceCheck && lastCheckedAddress === walletAddress) {
        return;
      }

      console.log('Checking user profile for:', walletAddress);

      const normalizedAddress = walletAddress.toLowerCase();
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setLastCheckedAddress(walletAddress);

      if (user) {
        console.log('User profile found:', user);
        setUserProfile(user);
        setShowOnboarding(false);
        
        // Update profile store with user data
        const profileStore = useProfileStore.getState();
        profileStore.setUsername(user.username || '');
        profileStore.setBio(user.bio || '');
        profileStore.setAvatar(user.avatar_url || '');
        // Update role using the correct type
        const userRole = user.user_type as 'gamer' | 'developer' | 'admin' | 'sponsor';
        useProfileStore.setState({ role: userRole || 'gamer' });
      } else {
        console.log('No user profile found, showing onboarding');
        setUserProfile(null);
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Profile check error:', error);
      // On error, still show onboarding to be safe
      setShowOnboarding(true);
    }
  }, [lastCheckedAddress]);

  // Initial setup effect
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to wallet service',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth]);

  const navigate = useNavigate();

  // Profile check effect when wallet connects or disconnects
  useEffect(() => {
    if (isConnected && aaWalletAddress && !isInitializing) {
      // Force check when wallet connects
      checkUserProfile(aaWalletAddress, true);
    } else if (!isConnected) {
      // Only reset states if we had a previous connection or are initializing
      const hadPreviousConnection = lastCheckedAddress !== null || isInitializing;
      
      if (hadPreviousConnection) {
        setUserProfile(null);
        setShowOnboarding(false);
        setLastCheckedAddress(null);
        
        // Navigate to home page after state updates
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 0);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isConnected, aaWalletAddress, isInitializing, lastCheckedAddress, checkUserProfile, navigate]);

  // Development helper: expose function to force onboarding check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.forceOnboardingCheck = () => {
        if (aaWalletAddress) {
          console.log('Forcing onboarding check for:', aaWalletAddress);
          setLastCheckedAddress(null); // Reset to force check
          checkUserProfile(aaWalletAddress, true);
        } else {
          console.log('No wallet address to check');
        }
      };

      window.showOnboardingModal = () => {
        console.log('Forcing onboarding modal to show');
        setShowOnboarding(true);
      };
    }
  }, [aaWalletAddress, checkUserProfile]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Sonner />

            {isInitializing && (
              <LoadingModal
                isOpen={true}
                title="INITIALIZING"
                description="Please wait while we set up your wallet and connection."
                transactionText="Setting up your wallet and secure Web3 connection..."
              />
            )}

            <Routes>
              <Route path="/" element={<Layout userProfile={userProfile} />}>
                <Route index element={<Index />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="tournaments" element={<Tournaments />} />
                <Route path="profile" element={<Profile />} />
                <Route path="collections" element={<Collections />} />
                <Route path="collections/:id" element={<CollectionDetail />} />
                <Route path="developer/dashboard" element={<DeveloperProfile />} />
                <Route path="games/snake" element={<SnakeGame />} />
                <Route path="games/tetris" element={<Tetris />} />
                <Route path="sponsors" element={<Sponsors />} />
                <Route path="sponsor/login" element={<SponsorLogin />} />
                <Route path="sponsor/dashboard" element={<SponsorDashboard />} />
                <Route path="sponsor/create-tournament" element={<CreateTournament />} />
                <Route path="sponsor/analytics" element={<SponsorAnalytics />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>

            <OnboardingModal
              isOpen={showOnboarding}
              onComplete={async (userData) => {
                try {
                  if (!aaWalletAddress) {
                    throw new Error('Wallet not connected');
                  }

                  const normalizedWalletAddress = aaWalletAddress.toLowerCase();

                  // Prepare user data for Supabase
                  const userProfileData = {
                    ...userData,
                    wallet_address: normalizedWalletAddress,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  // Remove any undefined values and the id field
                  Object.keys(userProfileData).forEach(key => {
                    if (userProfileData[key] === undefined || key === 'id') {
                      delete userProfileData[key];
                    }
                  });

                  console.log('Creating/updating user profile:', userProfileData);

                  // First, check if user exists
                  const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('wallet_address', normalizedWalletAddress)
                    .single();

                  let user;

                  if (existingUser) {
                    console.log('Updating existing user');
                    // Update existing user
                    const { data: updatedUser, error: updateError } = await supabase
                      .from('users')
                      .update(userProfileData)
                      .eq('wallet_address', normalizedWalletAddress)
                      .select()
                      .single();

                    if (updateError) throw updateError;
                    user = updatedUser;
                  } else {
                    console.log('Creating new user');
                    // Create new user
                    const { data: newUser, error: createError } = await supabase
                      .from('users')
                      .insert(userProfileData)
                      .select()
                      .single();

                    if (createError) throw createError;
                    user = newUser;
                  }

                  if (!user) {
                    throw new Error('No user data returned from database');
                  } console.log('Profile save successful:', user);

                  // Update the user profile in the app state
                  setUserProfile(user);
                  setShowOnboarding(false);
                  setLastCheckedAddress(aaWalletAddress); // Update last checked

                  // Also fetch the full profile through the profile store for consistency
                  const profileStore = useProfileStore.getState();
                  await profileStore.fetchProfile(aaWalletAddress);

                  toast({
                    title: 'Welcome to the arcade!',
                    description: 'Your profile has been created successfully.',
                  });

                } catch (error) {
                  console.error('Error in onComplete:', error);
                  toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to save profile',
                    variant: 'destructive',
                  });
                  // Don't close onboarding on error
                }
              }}
            />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
export default App;
