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
  initializeWeb3Auth: () => Promise<Web3Auth>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  updateSigner: (signer: ethers.Signer) => void;
  initAAWallet: () => Promise<void>;
}

const web3auth = new Web3Auth(web3AuthOptions);

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

  initializeWeb3Auth: async ():Promise<Web3Auth>  => {
    set({ isLoading: true, error: null });
    try {
      // Check if already initialized
    if (get().isInitialized) {
      return web3auth;
    }
    
      // Initialize Web3Auth if not already done
    if (!web3auth.provider) {
      await web3auth.initModal();
    }
    set({ 
      web3auth,
      provider: web3auth.provider,
      isLoading: false,
      isInitialized: true,
      isConnected: !!web3auth.provider
    });

    return web3auth;
    } catch (error) {
      console.error('Failed to initialize Web3Auth:', error);
      set({ 
        isLoading: false,
        error: 'Failed to initialize Web3Auth'
      });
      throw error;
    }
  },

  connectWallet: async ()=> {
    set({ isLoading: true, error: null });
    try {
      // Ensure Web3Auth is initialized
      const web3auth = get().web3auth || (await get().initializeWeb3Auth());
      
      // Check if already connected
      if (web3auth.provider) {
        const provider = new ethers.BrowserProvider(web3auth.provider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
  
        set({
          provider:web3auth.provider,
          aaWalletAddress: address.toLowerCase(),
          isConnected: true,
          isLoading: false,
        });
  
        return address;
      }
  
      // Connect if not already connected
      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) {
        throw new Error('Failed to connect to Web3Auth provider');
      }
  
      const aaProvider = new ethers.BrowserProvider(web3authProvider);
      const aaSigner = await aaProvider.getSigner();
      const address = await aaSigner.getAddress();
  
      // set({ 
      //   provider: web3authProvider,
      //   aaProvider,
      //   aaSigner,
      //   aaWalletAddress: address,
      //   isConnected: true,
      //   isInitialized: true,
      //   isLoading: false,
      // });
      set({
        provider:web3authProvider,
        isConnected: true,
        aaWalletAddress: address.toLowerCase(),
        isLoading: false,
      });
  
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ 
        isLoading: false,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
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