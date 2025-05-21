
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import GameView from "./pages/GameView";
import NotFound from "./pages/NotFound";
import Developers from "./pages/Developers";
import Rewards from "./pages/Rewards";
import ClickerGame from "./pages/ClickerGame";
import AchievementMinting from "./pages/AchievementMinting";
import TicTacToe from "./games/tic-tac-toe/TicTacToe";
import MemoryGame from "./games/memory-game/MemoryGame";
import SpinToWin from "./games/spin-to-win/SpinToWin";

const Home = () => (

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games/:gameId" element={<GameView />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/games/clicker" element={<ClickerGame />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/games/memory-game" element={<MemoryGame />} />
          <Route path="/games/spin-to-win" element={<SpinToWin />} />
          <Route path="/achievement-minting" element={<AchievementMinting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
);

export default Home;
