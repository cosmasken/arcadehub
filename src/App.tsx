
import React from 'react';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useWalletStore } from "./stores/useWalletStore";
import LoadingModal from "./components/LoadingModal";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import OnboardingModal from "./components/OnboardingModal";
import { useSupabase } from "./hooks/use-supabase";
import type { User } from "./types/supabase";

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

const queryClient = new QueryClient();

const App = () => {
  const { isInitialized, isConnected, aaWalletAddress, initializeWeb3Auth } = useWalletStore();
  const { getUserByWallet } = useSupabase();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<User | null>(null);

  // Initialize Web3Auth and check user status when the app loads or wallet connects
  React.useEffect(() => {
    const initAndCheckUser = async () => {
      try {
        await initializeWeb3Auth();
        setIsInitializing(false); // Web3Auth initialization is complete

        if (aaWalletAddress) {
          const user = await getUserByWallet(aaWalletAddress);
          if (user) {
            setUserProfile(user);
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth or check user:', error);
        setIsInitializing(false);
      }
    };

    initAndCheckUser();

    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, [initializeWeb3Auth, aaWalletAddress, getUserByWallet]);

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={(userData) => {
            setUserProfile(userData);
            setShowOnboarding(false);
          }}
        />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Routes that use the Layout */}
              <Route element={
                <Layout userProfile={userProfile}>
                  <Outlet />
                </Layout>
              }>
                <Route path="/" element={<Index />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:id" element={<CollectionDetail />} />
                <Route path="/games/honey-clicker" element={<HoneyClicker />} />
                <Route path="/games/snake" element={<SnakeGame />} />
                <Route path="/games/tetris" element={<Tetris />} />
                <Route path="/games/space-invaders" element={<SpaceInvaders />} />
              </Route>
              
              {/* Routes that don't use the Layout */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/sponsor/login" element={<SponsorLogin />} />
              <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
              <Route path="/sponsor/create-tournament" element={<CreateTournament />} />
              <Route path="/sponsor/analytics" element={<SponsorAnalytics />} />
              <Route path="/developer" element={<DeveloperUpload />} />
              <Route path="/developer/profile/:id" element={<DeveloperProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
