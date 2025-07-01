import { create } from 'zustand';
import { ethers } from 'ethers';
import { Web3Auth } from "@web3auth/modal";
import type { Web3AuthOptions } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import type { CustomChainConfig } from "@web3auth/base";
import type { IProvider } from "@web3auth/base";
import {  getAAWalletAddress } from '../lib/aaUtils';
import useTokenStore from './useTokenStore';


//custom chain is described as 
const customChain :CustomChainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x2b1",
      rpcTarget: "https://rpc-testnet.nerochain.io",
      displayName: "Nero",
      blockExplorerUrl: "https://testnet.neroscan.io",
      ticker: "NERO",
      tickerName: "Nero",
      decimals: 18,
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      isTestnet: true
  }


const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: customChain },
})

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
}

interface WalletStore {
  isConnected: boolean;
  isInitialized: boolean;
  supportedTokens: TokenInfo[];
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  aaProvider: ethers.BrowserProvider | null;
  aaSigner: ethers.Signer | null;
  aaWalletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  initializeWeb3Auth: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateSigner: (signer: ethers.Signer) => void;
  initAAWallet: () => Promise<void>;
}

let web3authInstance: Web3Auth | null = null;

const getWeb3Auth = (): Web3Auth => {
  if (!web3authInstance) {
    web3authInstance = new Web3Auth(web3AuthOptions);
    const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });
    adapters.forEach((adapter) => {
      web3authInstance?.configureAdapter(adapter);
    });
  }
  return web3authInstance;
};

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  isInitialized: false,
  supportedTokens: [],
  web3auth: null,
  provider: null,
  aaProvider: null,
  aaSigner: null,
  aaWalletAddress: null,
  isLoading: false,
  error: null,

  initializeWeb3Auth: async () => {
    set({ isLoading: true, error: null });
    try {
      const web3auth = getWeb3Auth();
      if (!web3auth) {
        throw new Error('Failed to initialize Web3Auth');
      }
      
      // Check if already initialized or connected
      if (web3auth.status === 'connected') {
        console.log('Web3Auth already connected');
        set({ 
          web3auth,
          provider: web3auth.provider,
          isConnected: true,
          isInitialized: true,
          isLoading: false
        });
        return web3auth;
      }
      
      if (web3auth.status === 'initialized') {
        console.log('Web3Auth already initialized');
        set({ 
          web3auth,
          provider: web3auth.provider,
          isInitialized: true,
          isLoading: false
        });
        return web3auth;
      }
      
      // Only initialize if not already initializing
      if (web3auth.status !== 'initializing') {
        console.log('Initializing Web3Auth...');
        await web3auth.initModal();
      }
      
      set({ 
        web3auth,
        provider: web3auth.provider,
        isInitialized: true,
        isLoading: false,
      });
      
      return web3auth;
    } catch (error) {
      console.error('Failed to initialize Web3Auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Web3Auth';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  connectWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      // First ensure Web3Auth is initialized
      const web3auth = await get().initializeWeb3Auth();
      
      // If already connected, just return the address
      if (web3auth.status === 'connected' && web3auth.provider) {
        const provider = new ethers.BrowserProvider(web3auth.provider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        set({
          isConnected: true,
          provider: web3auth.provider,
          aaProvider: provider,
          aaSigner: signer,
          isLoading: false,
          error: null
        });
        
        // Initialize AA wallet
        await get().initAAWallet();
        return address;
      }
      // web3auth is already initialized and not connected
      if (!web3auth.provider) {
        throw new Error('Web3Auth provider not available');
      }
      
      // Initialize Web3Auth if not already initialized
      if (!web3auth.provider) {
        await web3auth.initModal();
      }

      // Connect to the wallet
      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) {
        throw new Error('Failed to connect to Web3Auth provider');
      }

      // Set up ethers provider and signer
      const aaProvider = new ethers.BrowserProvider(web3authProvider);
      const aaSigner = await aaProvider.getSigner();
      const address = await aaSigner.getAddress();

      console.log('Connected address:', address);
      
      // Update state with connection details
      set({ 
        web3auth,
        provider: web3authProvider,
        aaProvider,
        aaSigner,
        isLoading: false,
        isConnected: true,
        isInitialized: true,
      });

      // Initialize AA wallet
      await get().initAAWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ 
        isLoading: false,
        isConnected: false,
        error: 'Failed to connect wallet. Please try again.'
      });
      throw error;
    }
  },

  disconnectWallet: async () => {
    try {
      const web3auth = get().web3auth;
      if (web3auth) {
        // First clear the provider and auth state
        set({ 
          isConnected: false,
          provider: null,
          aaProvider: null,
          aaSigner: null,
          aaWalletAddress: null,
          isLoading: true,
          error: null
        });

        // Then logout and clean up Web3Auth
        await web3auth.logout();
        
        // Clear any remaining auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('openlogin_store');
          sessionStorage.clear();
        }
      }
      
      // Final state reset
      set({ 
        isConnected: false,
        isInitialized: false,
        web3auth: null,
        provider: null,
        aaProvider: null,
        aaSigner: null,
        aaWalletAddress: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      set({ 
        error: 'Failed to disconnect wallet',
        isLoading: false 
      });
    }
  },

  updateSigner: (signer: ethers.Signer) => {
    set((state) => ({
      ...state,
      aaSigner: signer
    }));
  },

  initAAWallet: async () => {
    const { aaSigner } = get();
    if (!aaSigner) return;

    try {
      const aaWallet = await getAAWalletAddress(aaSigner);
      // const aaBuilder = await initAABuilder(aaSigner);
      console.log('AA Wallet Address:', aaWallet);
      
      set({ 
        aaWalletAddress: aaWallet,
      });

      // Load supported tokens after AA wallet is initialized
      const tokenStore = useTokenStore.getState();
      await tokenStore.loadSupportedTokens(aaSigner);
      console.log('Supported tokens loaded:', tokenStore.supportedTokens);
      
      // Load token balances for the AA wallet
      await tokenStore.loadTokenBalances(aaWallet, await tokenStore.supportedTokens);
      console.log(`Token balances loaded for ${aaWallet}`, await tokenStore.tokenBalances);

    } catch (error) {
      console.error('Failed to initialize AA wallet:', error);
      set({ error: 'Failed to initialize AA wallet' });
    }
  }
}));

export default useWalletStore;