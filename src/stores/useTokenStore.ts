/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import {
  getSupportedTokens,
  getAllTokenBalances,
  initAAClient,
  initAABuilder,
} from '../utils/aaUtils';
import { getApiKey, API_OPTIMIZATION } from '../config';
import type { SupportedToken, TokenBalances, TokenApprovals } from '../types/tokens';

interface TokenStore {
  supportedTokens: SupportedToken[];
  tokenBalances: TokenBalances;
  eoaTokenBalances: TokenBalances;
  tokenApprovals: TokenApprovals;
  selectedToken: string;
  isLoadingTokens: boolean;
  isLoadingBalances: boolean;
  isApproving: boolean;
  loadSupportedTokens: (signer: ethers.Signer) => Promise<void>;
  loadTokenBalances: (aaWalletAddress: string, supportedTokens: SupportedToken[]) => Promise<void>;
  loadEoaTokenBalances: (userAddress: string, supportedTokens: SupportedToken[]) => Promise<void>;
  checkTokenAllowance: (tokenAddress: string, signer: ethers.Signer, aaWalletAddress: string) => Promise<boolean>;
  approveToken: (tokenAddress: string, signer: ethers.Signer, aaWalletAddress: string) => Promise<boolean>;
  transferTokensToAAWallet: (tokenAddress: string, amount: string, signer: ethers.Signer, userAddress: string, aaWalletAddress: string) => Promise<boolean>;
  setSelectedToken: (tokenAddress: string) => void;
  hasEnoughTokens: (tokenAddress: string) => boolean;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  supportedTokens: [],
  tokenBalances: {},
  eoaTokenBalances: {},
  tokenApprovals: {},
  selectedToken: '',
  isLoadingTokens: false,
  isLoadingBalances: false,
  isApproving: false,
  loadSupportedTokens: async (signer) => {
    try {
      set({ isLoadingTokens: true });
      const client = await initAAClient(signer);
      const builder = await initAABuilder(signer);
      const tokens = await getSupportedTokens(client, builder);
      set({ supportedTokens: tokens });
      if (API_OPTIMIZATION.debugLogs) {
        console.log('Supported tokens loaded:', tokens);
      }
    } catch (error: any) {
      console.error('Error loading supported tokens:', error);
      toast.error('Failed to load supported tokens');
    } finally {
      set({ isLoadingTokens: false });
    }
  },
  loadTokenBalances: async (aaWalletAddress, supportedTokens) => {
    if (!aaWalletAddress || supportedTokens.length === 0) return;
    try {
      set({ isLoadingBalances: true });
      const balances = await getAllTokenBalances(aaWalletAddress, supportedTokens);
      set({ tokenBalances: balances });
      if (API_OPTIMIZATION.debugLogs) {
        console.log('Token balances loaded for AA wallet:', balances);
      }
    } catch (error) {
      console.error('Error loading token balances:', error);
    } finally {
      set({ isLoadingBalances: false });
    }
  },
  loadEoaTokenBalances: async (userAddress, supportedTokens) => {
    if (!userAddress || supportedTokens.length === 0) return;
    try {
      const balances = await getAllTokenBalances(userAddress, supportedTokens);
      set({ eoaTokenBalances: balances });
      if (API_OPTIMIZATION.debugLogs) {
        console.log('EOA Token balances loaded:', balances);
      }
    } catch (error: any) {
      console.error('Error loading EOA token balances:', error);
    }
  },
  checkTokenAllowance: async (tokenAddress, signer, aaWalletAddress) => {
    if (!signer || !aaWalletAddress) return false;
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function allowance(address owner, address spender) view returns (uint256)'],
        signer
      );
      const paymasterAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
      const allowance = await tokenContract.allowance(aaWalletAddress, paymasterAddress);
      const hasAllowance = !allowance.isZero();
      set((state) => ({
        tokenApprovals: { ...state.tokenApprovals, [tokenAddress]: hasAllowance },
      }));
      return hasAllowance;
    } catch (error) {
      console.error('Error checking token allowance:', error);
      return false;
    }
  },
  approveToken: async (tokenAddress, signer, aaWalletAddress) => {
    if (!signer || !aaWalletAddress) {
      toast.error('Connect your wallet first');
      return false;
    }
    set({ isApproving: true });
    try {
      const client = await initAAClient(signer);
      const builder = await initAABuilder(signer);
      builder.setPaymasterOptions({
        apikey: getApiKey(),
        rpc: 'https://paymaster-testnet.nerochain.io',
        type: '0',
      });
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );
      const paymasterAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
      const maxApproval = ethers.parseUnits('1000000000', 18);
      const callData = tokenContract.interface.encodeFunctionData('approve', [paymasterAddress, maxApproval]);
      const userOp = await builder.execute(tokenAddress, 0, callData);
      const result = await client.sendUserOperation(userOp);
      await result.wait();
      set((state) => ({
        tokenApprovals: { ...state.tokenApprovals, [tokenAddress]: true },
      }));
      toast.success('Token approved successfully!');
      return true;
    } catch (error: any) {
      console.error('Error approving token:', error);
      toast.error(`Error approving token: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      set({ isApproving: false });
    }
  },
  transferTokensToAAWallet: async (tokenAddress, amount, signer, userAddress, aaWalletAddress) => {
    if (!signer || !userAddress || !aaWalletAddress) {
      toast.error('Wallet not connected');
      return false;
    }
    set({ isApproving: true });
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function transfer(address to, uint amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ],
        signer
      );
      const decimals = await tokenContract.decimals();
      const amountToTransfer = ethers.parseUnits(amount, decimals);
      const tx = await tokenContract.transfer(aaWalletAddress, amountToTransfer);
      await tx.wait();
      toast.success('Tokens transferred successfully to your AA wallet!');
      const { loadTokenBalances, loadEoaTokenBalances, supportedTokens } = get();
      await loadTokenBalances(aaWalletAddress, supportedTokens);
      await loadEoaTokenBalances(userAddress, supportedTokens);
      return true;
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      toast.error(`Error transferring tokens: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      set({ isApproving: false });
    }
  },
  setSelectedToken: (tokenAddress) => {
    set({ selectedToken: tokenAddress });
  },
  hasEnoughTokens: (tokenAddress) => {
    const { supportedTokens, tokenBalances } = get();
    const token = supportedTokens.find((t) => t.address === tokenAddress);
    const balance = tokenBalances[tokenAddress] || '0';
    return parseFloat(balance) >= 0.0001;
  },
}));

export default useTokenStore;