import { create } from 'zustand';
import { ethers } from 'ethers';
import { Web3Auth } from "@web3auth/modal";
import type { Web3AuthOptions } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import type { IAdapter } from "@web3auth/base";
import type { IProvider } from "@web3auth/base";
import type { WalletConnectionState } from '@/types/wallet';
import {  getAAWalletAddress, initAABuilder } from '../utils/aaUtils';
import { TESTNET_CONFIG } from '../config';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: `0x${TESTNET_CONFIG.chain.chainId.toString(16)}`,
  rpcTarget: TESTNET_CONFIG.chain.rpcUrl,
  displayName: TESTNET_CONFIG.chain.chainName,
  blockExplorerUrl: TESTNET_CONFIG.chain.explorer,
  ticker: TESTNET_CONFIG.chain.currency,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

interface WalletStore {
  walletState: WalletConnectionState;
  supportedTokens: any[];
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

export const useWalletStore = create<WalletStore>((set, get) => ({
  walletState: {
    isConnected: false,
    isLoading: false,
    isInitialized: false,
    userAddress: '',
    aaWalletAddress: '',
    signer: null,
    EOAProvider: null,
    eoaAddress: '',
    smartAccount: null,
    address: '',
  },
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
      const web3auth = new Web3Auth(web3AuthOptions);
      const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });
      adapters.forEach((adapter) => {
        web3auth.configureAdapter(adapter);
      });
      
      await web3auth.initModal();
      set({ 
        web3auth,
        provider: web3auth.provider,
        isLoading: false,
        walletState: { ...get().walletState, isInitialized: true }
      });
    } catch (error) {
      console.error('Failed to initialize Web3Auth:', error);
      set({ 
        isLoading: false,
        error: 'Failed to initialize Web3Auth'
      });
      throw error;
    }
  },

  connectWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      await get().initializeWeb3Auth();
      const web3auth = get().web3auth;
      if (!web3auth) throw new Error('Web3Auth not initialized');

      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) {
        throw new Error('Failed to connect to Web3Auth provider');
      }

      const aaProvider = new ethers.BrowserProvider(web3authProvider);
      const aaSigner = await aaProvider.getSigner();
      const address = await aaSigner.getAddress();
      
      set({ 
        provider: web3authProvider,
        aaProvider,
        aaSigner,
        isLoading: false,
        walletState: { 
          ...get().walletState,
          isConnected: true,
          isLoading: false,
          userAddress: address,
          signer: aaSigner,
          EOAProvider: aaProvider,
          eoaAddress: address,
          address: address
        }
      });

      await get().initAAWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ 
        isLoading: false,
        error: 'Failed to connect wallet'
      });
      throw error;
    }
  },

  disconnectWallet: async () => {
    try {
      const web3auth = get().web3auth;
      if (web3auth) {
        await web3auth.logout();
      }
      set({ 
        walletState: {
          isConnected: false,
          isLoading: false,
          isInitialized: false,
          userAddress: '',
          aaWalletAddress: '',
          signer: null,
          EOAProvider: null,
          eoaAddress: '',
          smartAccount: null,
          address: '',
        },
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
      set({ error: 'Failed to disconnect wallet' });
    }
  },

  updateSigner: (signer: ethers.Signer) => {
    set((state) => ({
      walletState: { ...state.walletState, signer },
      aaSigner: signer
    }));
  },

  initAAWallet: async () => {
    const { aaSigner } = get();
    if (!aaSigner) return;

    try {
      const aaWallet = await getAAWalletAddress(aaSigner);
      const aaBuilder = await initAABuilder(aaSigner);
      
      set({ 
        aaWalletAddress: aaWallet,
        walletState: { 
          ...get().walletState,
          aaWalletAddress: aaWallet,
          smartAccount: aaBuilder
        }
      });
    } catch (error) {
      console.error('Failed to initialize AA wallet:', error);
      set({ error: 'Failed to initialize AA wallet' });
    }
  }
}));

export default useWalletStore;