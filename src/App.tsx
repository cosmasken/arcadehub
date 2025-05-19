import "./App.css";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Home from "./Home";
import UnloggedInView from "./UnloggedInView";
import useAuthStore from "./hooks/use-auth";

const queryClient = new QueryClient();

function App() {
  const { loggedIn, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <div className="pt-16">
            {loggedIn ? <Home /> : <UnloggedInView />}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;