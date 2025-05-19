
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

import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";




const Home = () => (

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game/:gameId" element={<GameView />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/games/clicker" element={<ClickerGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
);

export default Home;
