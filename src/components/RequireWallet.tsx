import React from "react";
import useWalletStore from "../stores/useWalletStore";
import LoadingModal from "./LoadingModal";
import { Button } from './ui/button';
import { Wallet } from 'lucide-react'; // Assuming you have a Wallet icon in lucide-react


const RequireWallet: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, isInitialized, connectWallet } = useWalletStore();
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // if (!isInitialized) {
  //   return (
      
  //   );
  // } else {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400">
          <h2 className="text-2xl font-mono mb-4">Wallet Not Connected</h2>
          <p className="mb-6">Please connect your wallet to use the app.</p>
          <LoadingModal
        isOpen={!isInitialized}
        title="INITIALIZING"
        description="Please wait while we set up your wallet and connection."
      />
          <Button
            onClick={handleConnect}
            className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs tracking-wider border-2 border-cyan-400 hover:border-green-400"
          >
            <Wallet className="w-4 h-4 mr-2" />
             CONNECT_WALLET
          </Button>

        </div>
      );
    }
  // }



  return <>{children}</>;
};

export default RequireWallet;