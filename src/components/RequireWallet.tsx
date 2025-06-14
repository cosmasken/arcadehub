import React from "react";
import { useWalletStore } from "../stores/useWalletStore";
import  LoadingModal  from "./LoadingModal";

const RequireWallet: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, isInitialized } = useWalletStore();

  if (!isInitialized) {
    return (
      <LoadingModal
        isOpen={true}
        title="INITIALIZING"
        description="Please wait while we set up your wallet and connection."
      />
    );
  }else
  {
 if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400">
        <h2 className="text-2xl font-mono mb-4">Wallet Not Connected</h2>
        <p className="mb-6">Please connect your wallet to use the app.</p>
        {/* Optionally add a connect button here */}
      </div>
    );
  }
  }

 

  return <>{children}</>;
};

export default RequireWallet;