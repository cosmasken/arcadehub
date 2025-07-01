import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";

// Hooks & Stores
import { useWalletStore } from "./stores/useWalletStore";
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
import HoneyClicker from "./pages/HoneyClicker";
import NotFound from "./pages/NotFound";
import SpaceInvaders from "./pages/SpaceInvaders";
import Admin from "./pages/Admin";
import Sponsors from "./pages/Sponsors";
import SponsorLogin from "./pages/SponsorLogin";
import SponsorDashboard from "./pages/SponsorDashboard";
import CreateTournament from "./pages/CreateTournament";
import SponsorAnalytics from "./components/SponsorAnalytics";
import SnakeGame from "./games/snake/SnakeGame";
import Tetris from "./games/tetris";
import WalletPage from "./pages/WalletPage";

const queryClient = new QueryClient();

const App = () => {
  const { aaWalletAddress, initializeWeb3Auth } = useWalletStore();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<User | null>(null);

  // Initialize Web3Auth and check user status when the app loads or wallet connects
  React.useEffect(() => {
    let isMounted = true;
    
    const initAndCheckUser = async () => {
      try {
        // Initialize Web3Auth
        await initializeWeb3Auth();
        
        if (!isMounted) return;
        
        // If wallet is connected, check user profile
        if (aaWalletAddress) {
          try {
            const { data: user, error } = await supabase
              .from('users')
              .select('*')
              .eq('wallet_address', aaWalletAddress)
              .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
              throw error;
            }

            if (user) {
              setUserProfile(user);
              setShowOnboarding(false);
            } else {
              setShowOnboarding(true);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            toast({
              title: 'Error',
              description: 'Failed to load user profile',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to wallet. Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initAndCheckUser();

    // Clean up on unmount
    return () => {
      isMounted = false;
    };
  }, [initializeWeb3Auth, aaWalletAddress]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400">Initializing...</p>
        </div>
      </div>
    );
  }

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
                <Route path="space-invaders" element={<SpaceInvaders />} />
                <Route path="snake" element={<SnakeGame />} />
                <Route path="tetris" element={<Tetris />} />
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
                  
                  // Prepare user data for Supabase
                  const userProfileData = {
                    ...userData,
                    wallet_address: aaWalletAddress,
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
                    .eq('wallet_address', aaWalletAddress)
                    .single();
                  
                  let user;
                  
                  if (existingUser) {
                    // Update existing user
                    const { data: updatedUser, error: updateError } = await supabase
                      .from('users')
                      .update(userProfileData)
                      .eq('wallet_address', aaWalletAddress)
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
                  
                  // Use a small timeout before reloading to allow the toast to show
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                  
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
