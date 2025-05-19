import { useEffect } from 'react';
import useAuthStore from '../use-auth';
import { 
  mintNFT,
  transferERC20Token,
  getNFTs,
  getSupportedTokens
} from '../lib/aaUTils';

export const useAAWallet = () => {
  const { aaSigner, aaWallet, initAAWallet } = useAuthStore();

  // Automatically reinitialize AA wallet if signer changes
  useEffect(() => {
    if (aaSigner && !aaWallet) {
      initAAWallet();
    }
  }, [aaSigner, aaWallet, initAAWallet]);

  // Wrap your AA functions with proper signer handling
  const wrappedMintNFT = async (metadataUri: string) => {
    if (!aaSigner) throw new Error("No AA signer available");
    return mintNFT(aaSigner, aaWallet!, metadataUri);
  };

  const wrappedTransferERC20 = async (recipient: string, amount: string) => {
    if (!aaSigner) throw new Error("No AA signer available");
    return transferERC20Token(aaSigner, recipient, ethers.utils.parseEther(amount));
  };

  return {
    aaWallet,
    isAAReady: !!aaWallet,
    mintNFT: wrappedMintNFT,
    transferERC20: wrappedTransferERC20,
    getNFTs: () => aaWallet ? getNFTs(aaWallet) : Promise.resolve([]),
    getSupportedTokens: () => aaSigner ? getSupportedTokens(aaSigner) : Promise.resolve([])
  };
};