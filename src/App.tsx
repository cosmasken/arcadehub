
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { useWalletStore } from "./stores/useWalletStore";
import LoadingModal from "./components/LoadingModal";
import SpaceInvaders from "./pages/SpaceInvaders";
import Admin from "./pages/Admin";
import Sponsors from "./pages/Sponsors";
import SponsorLogin from "./pages/SponsorLogin";
import SponsorDashboard from "./pages/SponsorDashboard";
import CreateTournament from "./pages/CreateTournament";
import SponsorAnalytics from "./components/SponsorAnalytics";

const queryClient = new QueryClient();

const App = () => {

  const { isInitialized } = useWalletStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LoadingModal
          isOpen={!isInitialized}
          title="INITIALIZING"
          description="Please wait while we set up your wallet and connection."
          transactionText="Setting up your wallet and secure Web3 connection..."
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/sponsors" element={<Sponsors />} />
             <Route path="/sponsor/login" element={<SponsorLogin />} />
            <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
            <Route path="/sponsor/create-tournament" element={<CreateTournament />} />
            <Route path="/sponsor/analytics" element={<SponsorAnalytics />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/developer" element={<DeveloperUpload />} />
            <Route path="/developer/profile/:id" element={<DeveloperProfile />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/games/honey-clicker" element={<HoneyClicker />} />
            <Route path="/games/space-invaders" element={<SpaceInvaders />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
