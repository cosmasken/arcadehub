import { create } from 'zustand';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import type { GasPriceInfo } from '../types/wallet';
import type { TokenGasPrices } from '../types/tokens';
import type { SupportedToken } from '../types/tokens';

interface GasPriceStore {
  gasPriceInfo: GasPriceInfo;
  tokenGasPrices: TokenGasPrices;
  loadingTokenGasPrices: boolean;
  fetchGasPrice: (signer: ethers.Signer | null) => Promise<void>;
  fetchTokenGasPrices: (supportedTokens: SupportedToken[], signer: ethers.Signer | null) => Promise<void>;
  formatLastUpdated: (date: Date) => string;
}

const defaultGasPriceInfo: GasPriceInfo = {
  gasPrice: '0',
  gasPriceGwei: '0',
  lastUpdated: new Date(),
  isLoading: false,
};

export const useGasPriceStore = create<GasPriceStore>((set,get) => ({
  gasPriceInfo: defaultGasPriceInfo,
  tokenGasPrices: {},
  loadingTokenGasPrices: false,
  fetchGasPrice: async (signer) => {
    try {
      set((state) => ({ gasPriceInfo: { ...state.gasPriceInfo, isLoading: true } }));
      if (!signer) {
        throw new Error('Signer not available');
      }
      const provider = signer.provider as ethers.BrowserProvider;
      if (!provider) {
        throw new Error('Provider not available');
      }
      const gasPrice = (await provider.getFeeData()).gasPrice;
      if (!gasPrice) {
        throw new Error('Gas price not available');
      }
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
      set({
        gasPriceInfo: {
          gasPrice: gasPrice.toString(),
          gasPriceGwei: parseFloat(gasPriceGwei).toFixed(2),
          lastUpdated: new Date(),
          isLoading: false,
        },
      });
    } catch (error: any) {
      console.error('Error fetching gas price:', error);
      toast.error(`Could not fetch gas price: ${error.message || 'Unknown error'}`);
      set((state) => ({ gasPriceInfo: { ...state.gasPriceInfo, isLoading: false } }));
    }
  },
  fetchTokenGasPrices: async (supportedTokens, signer) => {
    if (!signer || supportedTokens.length === 0) return;
    try {
      set({ loadingTokenGasPrices: true });
      
      let gasPrice = BigInt(get().gasPriceInfo.gasPrice || '0');
      if (gasPrice == BigInt(0)) {
        const provider = signer.provider as ethers.BrowserProvider;
        const gasPriceData = (await provider.getFeeData()).gasPrice;
        if (!gasPriceData) {
          throw new Error('Gas price not available');
        }
        gasPrice = BigInt(gasPriceData);
      }
      const estimatedGasLimit = BigInt(100000);
      const estimatedGasCostWei = gasPrice * estimatedGasLimit;
      const newTokenGasPrices: TokenGasPrices = {};
      for (const token of supportedTokens) {
        try {
          const tokenContract = new ethers.Contract(
            token.address,
            ['function decimals() view returns (uint8)'],
            signer
          );
          const decimals = await tokenContract.decimals();
          const conversionRate = token.price || 1;
          const gasCostInToken =
            (BigInt(estimatedGasCostWei) *
              BigInt(Math.floor(conversionRate * 100)) *
              BigInt(10 ** decimals)) /
            BigInt('1000000000000000000') /
            BigInt('100');
          const formattedGasCost = ethers.formatUnits(gasCostInToken, decimals);
          newTokenGasPrices[token.address] = {
            priceInToken: formattedGasCost,
            lastUpdated: new Date(),
          };
        } catch (error) {
          console.error(`Error calculating gas price for token ${token.symbol}:`, error);
        }
      }
      set({ tokenGasPrices: newTokenGasPrices });
    } catch (error: any) {
      console.error('Error fetching token gas prices:', error);
    } finally {
      set({ loadingTokenGasPrices: false });
    }
  },
  formatLastUpdated: (date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    }
    return date.toLocaleTimeString();
  },
}));

export default useGasPriceStore;