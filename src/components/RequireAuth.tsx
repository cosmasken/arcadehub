import React from 'react';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../stores/useWalletStore';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  showLoginPrompt?: () => void;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, showLoginPrompt }) => {
  const { isConnected, connect } = useWalletStore();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connect();
      // If there's a showLoginPrompt function, call it after successful connection
      if (showLoginPrompt) {
        showLoginPrompt();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 p-6 text-center">
        <div className="bg-gray-900/90 p-8 rounded-lg border border-cyan-400/30 max-w-md w-full">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">WALLET NOT CONNECTED</h3>
          <p className="text-gray-300 mb-6">Please connect your wallet to start playing.</p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-bold py-3"
            >
              <Wallet className="w-5 h-5 mr-2" />
              CONNECT WALLET
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              BACK TO HOME
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
