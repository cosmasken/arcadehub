import { create } from 'zustand';
import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, CustomChainConfig, IProvider } from '@web3auth/base';
import { WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { getAAWalletAddress } from '../lib/aaUtils';

const customChain: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x2b1',
  rpcTarget: 'https://rpc-testnet.nerochain.io',
  displayName: 'Nero',
  blockExplorerUrl: 'https://testnet.neroscan.io',
  ticker: 'NERO',
  tickerName: 'Nero',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  isTestnet: true,
};

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;

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
  provider: IProvider | null;
  aaProvider: ethers.BrowserProvider | null;
  aaSigner: ethers.Signer | null;
  aaWalletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  initWeb3Auth: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const useWalletStore = create<WalletStore>((set) => {
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig: customChain },
  });

  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: 'sapphire_devnet',
    chainConfig: customChain,
    privateKeyProvider, // Added privateKeyProvider
  });

  // const walletConnectAdapter = new WalletConnectV2Adapter({
  //   adapterSettings: { projectId: clientId },
  //   loginSettings: {},
  // });

  // web3auth.configureAdapter(walletConnectAdapter);

  return {
    isConnected: false,
    isInitialized: false,
    supportedTokens: [],
    provider: null,
    aaProvider: null,
    aaSigner: null,
    aaWalletAddress: null,
    isLoading: false,
    error: null,
    initWeb3Auth: async () => {
      try {
        set({ isLoading: true });
        await web3auth.initModal();
        set({ isInitialized: true, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },
    connect: async () => {
      try {
        set({ isLoading: true });
        const provider = await web3auth.connect();
        if (provider) {
          //const aaWalletAddress = await getAAWalletAddress(provider);
          const aaProvider = new ethers.BrowserProvider(provider);
          const aaSigner = await aaProvider.getSigner();
          const address = await aaSigner.getAddress();
          console.log('aaWalletAddress', address);
          set({ provider, aaProvider, aaSigner, aaWalletAddress: address, isConnected: true, isLoading: false });
        }
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },
    disconnect: async () => {
      try {
        set({ isLoading: true });
        await web3auth.logout();
        
        // Reset wallet state
        set({
          provider: null,
          aaProvider: null,
          aaSigner: null,
          aaWalletAddress: null,
          isConnected: false,
          isLoading: false,
        });

        // Clear any stored wallet data
        localStorage.removeItem('walletconnect');
        localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
        
        // Reset profile store
        const profileStore = (await import('./useProfileStore')).default;
        profileStore.setState({
          username: '',
          bio: '',
          avatar: '',
          role: 'gamer',
          arcBalance: 0,
          gamesPlayed: 0,
          achievements: [],
          assets: [],
          history: [],
          developerGames: [],
          friends: [],
          stats: {
            gamesPlayed: 0,
            achievements: 0,
            totalScore: 0,
            rank: '',
          },
          developerStats: {
            totalGames: 0,
            totalPlays: 0,
            totalRevenue: 0,
            avgRating: 0,
          },
        });
        
        // Clear any stored profile data
        localStorage.removeItem('profile');
        
      } catch (error) {
        console.error('Error during disconnect:', error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },
  };
});

export default useWalletStore;