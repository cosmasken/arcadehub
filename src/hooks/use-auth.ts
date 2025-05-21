import { create } from 'zustand';
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { chainConfig } from "../config";
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";
import { 
  initAAClient,
  initAABuilder,
  getAAWalletAddress
} from '@/lib/aaUtils';
import { ethers } from 'ethers';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

 const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

 const web3auth = new Web3Auth(web3AuthOptions);

// Configure adapters
const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });
adapters.forEach((adapter) => {
  web3auth.configureAdapter(adapter);
});


interface AuthState {
  provider: IProvider | null;
  loggedIn: boolean;
  web3auth: Web3Auth | null;
  aaWallet: string | null;
  aaProvider: ethers.BrowserProvider | null;
  aaSigner: ethers.Signer | null;
  init: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initAAWallet: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}


const useAuthStore = create<AuthState>((set,get) => ({
  provider: null,
  loggedIn: false,
  web3auth: null,
  aaWallet: null,
  aaProvider: null,
  aaSigner: null,
  isConnecting: false,
  error: null,


  init: async () => {
    await web3auth.initModal();
    set({ 
      web3auth,
      provider: web3auth.provider,
      loggedIn: web3auth.connected 
    });
    
    if (web3auth.connected) {
      await get().initAAWallet();
    }
  },


  login: async () => {
   // set({ isConnecting: true, error: null });
    const web3auth = get().web3auth;
     if (!web3auth) throw new Error("Web3Auth not initialized");
    
    const web3authProvider = await web3auth.connect();
    
    if (!web3authProvider) {
      throw new Error("Failed to connect to Web3Auth provider");
    }
    
     const aaProvider = new ethers.BrowserProvider(web3authProvider);
    const aaSigner = await aaProvider.getSigner();

    console.log("aasigner",aaSigner);
    
    set({ 
      provider: web3authProvider,
      loggedIn: true,
      aaProvider,
      aaSigner
    });
    
    await get().initAAWallet();
  },


    logout: async () => {
    const web3auth = get().web3auth;
    if (!web3auth) return;
    
    await web3auth.logout();
    set({ 
      provider: null,
      loggedIn: false,
      aaWallet: null,
      aaProvider: null,
      aaSigner: null
    });
  },

    initAAWallet: async () => {
    const { aaSigner } = get();
    if (!aaSigner) return;

    try {
      // Initialize AA components
      const client = await initAAClient();
      const builder = await initAABuilder(aaSigner);
      const aaWallet = await getAAWalletAddress(aaSigner);
      
       console.log("AA Wallet initialized:", aaWallet);
       console.log("AA Builder initialized:", builder);
       console.log("AA Client initialized:", client);

      set({ aaWallet });
      return aaWallet;
     
    } catch (error) {
      console.error("AA Wallet initialization failed:", error);
      return null;
    }
  }
}));

export default useAuthStore;