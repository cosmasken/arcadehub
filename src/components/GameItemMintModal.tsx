import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import useWalletStore from '../stores/useWalletStore';
import { usePinata } from '../hooks/use-pinata';
import { mintNFT } from '../lib/aaUtils';
import { useToast } from './ui/use-toast';

interface GameItemMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description: string;
    icon?: string | React.ReactNode;
  };
  onMintSuccess: (item: any, txHash?: string) => void;
}

const GameItemMintModal: React.FC<GameItemMintModalProps> = ({
  isOpen,
  onClose,
  item,
  onMintSuccess,
}) => {
  const { aaSigner, aaWalletAddress } = useWalletStore();
  const { uploadFile } = usePinata();
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    txHash?: string;
    error?: string;
  } | null>(null);

  const handleMint = async () => {
    if (!aaSigner || !aaWalletAddress) {
      toast({
        title: "Error",
        description: "AA wallet not connected.",
        variant: "destructive",
      });
      return;
    }
    setIsMinting(true);
    setMintResult(null);
    try {
      // Prepare metadata
      const imageUrl = typeof item.icon === 'string' ? item.icon : undefined;
      const metadata = {
        name: item.name,
        description: item.description,
        image: imageUrl,
        type: 'Game Item',
      };
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataHash = await uploadFile(metadataFile);
      if (!metadataHash) {
        toast({ title: 'Error', description: 'Failed to upload metadata to IPFS.', variant: 'destructive' });
        setIsMinting(false);
        return;
      }
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
      // Always sponsored (0)
      const result = await mintNFT(
        aaSigner,
        aaWalletAddress,
        metadataUri,
        0, // sponsored
        '',
        {}
      );
      toast({
        title: 'Mint Successful!',
        description: (
          <span>
            <span>Transaction:&nbsp;</span>
            <a
              href={`https://testnet.neroscan.io/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Neroscan
            </a>
          </span>
        ),
      });
      setMintResult({ success: true, txHash: result.transactionHash });
      onMintSuccess(item, result.transactionHash);
    } catch (e: any) {
      setMintResult({ success: false, error: e?.message || 'Minting failed' });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-cyan-400">Mint this item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          {item.icon && (
            typeof item.icon === 'string' ? (
              <img src={item.icon} alt={item.name} className="w-16 h-16 mb-2" />
            ) : (
              <span className="mb-2 text-3xl">{item.icon}</span>
            )
          )}
          <h2 className="text-lg font-bold text-cyan-400 mb-1">{item.name}</h2>
          <p className="text-sm text-green-400 mb-4 text-center">{item.description}</p>
          <div className="w-full bg-cyan-900/30 border border-cyan-400 rounded-lg p-3 mb-4">
            <span className="font-bold text-cyan-400">Sponsored</span>
            <span className="ml-2 text-xs text-green-400">(No gas or token required)</span>
          </div>
          {mintResult && (
            <div className={`w-full p-3 rounded-lg border mt-2 ${mintResult.success ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
              <div className="flex items-center space-x-2 mb-1">
                {mintResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-semibold">
                  {mintResult.success ? 'Mint Successful!' : 'Mint Failed'}
                </span>
              </div>
              {mintResult.success && mintResult.txHash && (
                <div className="text-xs text-cyan-400 break-all">Tx: {mintResult.txHash}</div>
              )}
              {mintResult.error && (
                <div className="text-xs text-red-400">{mintResult.error}</div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            disabled={isMinting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMint}
            className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
            disabled={isMinting || mintResult?.success}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              <>Mint Item</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameItemMintModal;
