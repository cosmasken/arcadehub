import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Collections from "./pages/Collections"
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Developers from "./pages/Developers";
import Rewards from "./pages/Rewards";
import GameView from "./pages/GameView";
import Navbar from "./components/Navbar";
import GameUpload from "./pages/GameUpload";


const queryClient = new QueryClient();
;


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/games/:gameId" element={<GameView />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="collections" element={<Collections />} />
              <Route path="/upload" element={<GameUpload />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
