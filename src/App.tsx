import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";

// Hooks & Stores
import useWalletStore from "./stores/useWalletStore";
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
import HoneyClicker from './pages/HoneyClicker';
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

const App = () => {
  const { aaWalletAddress, initWeb3Auth } = useWalletStore();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<User | null>(null);


const initializeAuth = async () => {
  try {
    await initWeb3Auth();
   
  } catch (error) {
    console.error('Auth initialization error:', error);
    throw error;
  }
};


const checkUserProfile = async (walletAddress: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (user) {
      setUserProfile(user);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  } catch (error) {
    console.error('Profile check error:', error);
    // Don't block the app if profile check fails
  }
};


useEffect(() => {
  let isMounted = true;

  const init = async () => {
    try {
      // First initialize auth
      await initializeAuth();
      
      // Only check profile if we have a wallet address
      const { aaWalletAddress } = useWalletStore.getState();
      if (aaWalletAddress) {
        await checkUserProfile(aaWalletAddress);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      // Handle auth error (but don't show for profile errors)
      if (error instanceof Error && error.message.includes('auth')) {
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to wallet service',
          variant: 'destructive',
        });
      }
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
}, []);

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
                <Route path="developer-profile/:id" element={<DeveloperProfile />} />
                <Route path="honey-clicker" element={<HoneyClicker />} />
                <Route path="games/snake" element={<SnakeGame />} />
                <Route path="games/tetris" element={<Tetris />} />
                <Route path="sponsors" element={<Sponsors />} />
                <Route path="sponsor-login" element={<SponsorLogin />} />
                <Route path="sponsor-dashboard" element={<SponsorDashboard />} />
                <Route path="create-tournament" element={<CreateTournament />} />
                <Route path="sponsor-analytics" element={<SponsorAnalytics />} />
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
                    updated_at: new Date().toISOString(),
                  };
                  
                  // Remove any undefined values and the id field
                  Object.keys(userProfileData).forEach(key => {
                    if (userProfileData[key] === undefined || key === 'id') {
                      delete userProfileData[key];
                    }
                  });
                  
                  // First, check if user exists
                  const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('wallet_address', normalizedWalletAddress)
                    .single();
                  
                  let user;
                  
                  if (existingUser) {
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
                  }
                  
                  // Update the user profile in the app state
                  setUserProfile(user);
                  setShowOnboarding(false);
                  
                  toast({
                    title: 'Profile updated',
                    description: 'Your profile has been saved successfully.',
                  });
                  
      
                  
                } catch (error) {
                  console.error('Error in onComplete:', error);
                  toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to save profile',
                    variant: 'destructive',
                  });
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
