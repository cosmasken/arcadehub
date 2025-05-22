import React, { useEffect, useState } from 'react';
import './App.css';
import MintOperationContainer from './components/minting/MintOperationContainer';
import TestTokenMinting from './components/minting/TestTokenMinting';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TourGuide from './components/TourGuide';
import { useWalletStore } from './stores/useWalletStore';

// Wallet connector component
const WalletConnector = () => {
  const { 
    walletState, 
    isLoading,
    error,
    initializeWeb3Auth, 
    connectWallet, 
    disconnectWallet 
  } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!walletState.isInitialized) {
          await initializeWeb3Auth();
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error);
      }
    };
    init();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (error) {
    return (
      <div className="wallet-error">
        <p>Error: {error}</p>
        <button onClick={handleConnect}>Retry</button>
      </div>
    );
  }

  if (isLoading || isConnecting) {
    return (
      <div className="wallet-loading">
        <p>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="wallet-connector">
      {walletState.isConnected ? (
        <div className="wallet-connected-info">
          <div className="wallet-info">
            <span className="wallet-address">
              {walletState.userAddress?.slice(0, 6)}...{walletState.userAddress?.slice(-4)}
            </span>
            <button onClick={handleDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>
          {walletState.aaWalletAddress && (
            <div className="aa-wallet-info">
              <span className="aa-wallet-label">AA Wallet:</span>
              <span className="aa-wallet-address">
                {walletState.aaWalletAddress.substring(0, 6)}...{walletState.aaWalletAddress.substring(walletState.aaWalletAddress.length - 4)}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(walletState.aaWalletAddress)}
                className="btn-copy"
                title="Copy address"
              >
                📋
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleConnect} className="connect-btn">
          Connect Wallet
        </button>
      )}
    </div>
  );
};

function App() {

  const [activeTab, setActiveTab] = useState<'nft' | 'token'>('nft');

  return (
    <div className="App" data-tour="app-container">
      <TourGuide autoStart={false} />
      <header className="App-header">
        <div className="nero-brand">
          <h1 className="pixelated">NEROCHAIN</h1>
          <div className="brand-accent">ACCOUNT ABSTRACTION</div>
        </div>
        <p className="subtitle">Build gasless transactions with Paymaster support</p>
        <WalletConnector />
      </header>

      <main className="App-main">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'nft' ? 'active' : ''}`}
            onClick={() => setActiveTab('nft')}
          >
            NFT Minting
          </button>
          <button
            className={`tab-button ${activeTab === 'token' ? 'active' : ''}`}
            onClick={() => setActiveTab('token')}
          >
            TestToken Minting
          </button>
        </div>

        {activeTab === 'nft' ? <MintOperationContainer /> : <TestTokenMinting />}
      </main>

      <footer className="App-footer">
        <div className="footer-content">
          <p>
            2023 Nerochain -{' '}
            <a href="https://nerochain.io" target="_blank" rel="noreferrer">
              nerochain.io
            </a>
          </p>
          <div className="footer-links">
            <a href="https://docs.nerochain.io" target="_blank" rel="noreferrer">
              Docs
            </a>
            <a href="https://discord.gg/nerochain" target="_blank" rel="noreferrer">
              Discord
            </a>
            <a href="https://github.com/nerochain" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;