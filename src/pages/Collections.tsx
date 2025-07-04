import Layout from "../components/Layout";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import useWalletStore from "../stores/useWalletStore";
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DialogFooter } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Slider } from '../components/ui/slider';
import { Wallet, Gift, Loader2 } from 'lucide-react';
import LoadingModal from '../components/LoadingModal';
import { TESTNET_CONFIG } from '../config';
import { NFT } from '../types/nft';

// Define the shape of the NFT data returned from the API
interface RawNFT {
  id?: string | number;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  rarity?: string;
  game?: string;
}

// Type guard to check if an object matches the RawNFT interface
function isRawNFT(obj: unknown): obj is RawNFT {
  return (
    obj &&
    'tokenId' in obj &&
    'name' in obj &&
    'description' in obj &&
    'image' in obj
  );
}
import { useToast } from '../components/ui/use-toast';
import { ethers } from 'ethers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  getNFTs,
  getProvider,
  approveNFTForContractAA,
  transferNFTAA
} from '../lib/aaUtils';

const tradeTypes = [
  { id: 'send', label: 'Send as Gift', icon: Gift },
];

const rarityColors: Record<string, string> = {
  Legendary: "bg-yellow-500 text-yellow-900",
  Epic: "bg-purple-500 text-purple-100",
  Rare: "bg-blue-500 text-blue-100",
  Common: "bg-gray-500 text-gray-100",
};

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
    <p className="text-cyan-200">Loading your NFTs...</p>
  </div>
);

const Collections: React.FC = () => {
  const { isConnected, aaWalletAddress, aaSigner } = useWalletStore();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [tradeType, setTradeType] = useState('send');
  const [tradeAddress, setTradeAddress] = useState('');
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [gasMultiplier, setGasMultiplier] = useState([1.5]);

  const loadNFTs = useCallback(async () => {
    if (!isConnected || !aaWalletAddress) {
      setNfts([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await getNFTs(aaWalletAddress);
      
      // Ensure response is an array
      const fetchedNFTs = Array.isArray(response) ? response : [];
      
      // Map the fetched NFTs to match the NFT interface with proper type safety
      const formattedNFTs: NFT[] = fetchedNFTs
        .filter(isRawNFT) // Filter out any malformed NFT data
        .map((nft): NFT => ({
          id: nft.id?.toString() ?? nft.tokenId.toString(),
          tokenId: nft.tokenId.toString(),
          name: nft.name,
          description: nft.description,
          image: nft.image,
          rarity: 'Common',
          game: 'Unknown Game'
        }));
        
      setNfts(formattedNFTs);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load NFTs. Please try again later.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, aaWalletAddress]);

  useEffect(() => {
    if (isConnected) {
      loadNFTs();
    } else {
      setNfts([]);
    }
  }, [isConnected, loadNFTs]);

  const handleTradeSellSend = (nft: NFT) => {
    setSelectedNFT(nft);
    setModalOpen(true);
    setTradeType('send');
    setTradeAddress('');
    setGasMultiplier([1.5]);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNFT(null);
    setTradeAddress('');
    setIsApproved(false);
    setApprovalError(null);
  };

  const checkApproval = useCallback(async () => {
    setApprovalError(null);
    setIsApproved(false);
    if (selectedNFT && aaSigner && aaWalletAddress) {
      try {
        const nftContractAddress = TESTNET_CONFIG.smartContracts.arcadeNFT;
        const operatorAddress = TESTNET_CONFIG.smartContracts.nftManager;
        const nftContract = new ethers.Contract(
          nftContractAddress,
          ["function isApprovedForAll(address owner, address operator) view returns (bool)"],
          getProvider()
        );
        const approved = await nftContract.isApprovedForAll(aaWalletAddress, operatorAddress);
        setIsApproved(approved);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to check NFT approval";
        setApprovalError(errorMessage);
      }
    }
  }, [selectedNFT, aaSigner, aaWalletAddress]);

  useEffect(() => {
    if (modalOpen) {
      checkApproval();
    }
  }, [modalOpen, checkApproval]);

  const handleApproveNFT = async () => {
    if (!aaSigner) {
      setApprovalError("Wallet not connected. Please connect your wallet.");
      toast({
        title: "Error",
        description: "Wallet not connected. Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }
    setIsApproving(true);
    setApprovalError(null);
    setIsLoadingModalOpen(true);
    try {
      const nftContractAddress = TESTNET_CONFIG.smartContracts.arcadeNFT;
      const operatorAddress = TESTNET_CONFIG.smartContracts.nftManager;

        let multiplier = Math.round(gasMultiplier[0] * 100);
        multiplier = Math.max(50, Math.min(500, multiplier));
      const result = await approveNFTForContractAA(aaSigner, nftContractAddress, operatorAddress, {
        gasMultiplier: multiplier,
      });
      if (result.success) {
        setIsApproved(true);
        toast({
          title: "Approval Successful",
          description: "NFT approved for transfer.",
        });
      } else {
        setApprovalError("Approval failed. Please try again.");
        toast({
          title: "Error",
          description: "Failed to approve NFT for transfer.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setApprovalError("Approval failed: " + errorMessage);
      toast({
        title: "Error",
        description: "Approval failed: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
      setIsLoadingModalOpen(false);
    }
  };

  const handleConfirm = async () => {
    if (!aaSigner || !aaWalletAddress) {
      toast({
        title: "Error",
        description: "Wallet not connected. Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }
    if (!ethers.isAddress(tradeAddress)) {
      toast({
        title: "Error",
        description: "Invalid recipient address.",
        variant: "destructive",
      });
      return;
    }
    if (tradeType === 'send' && selectedNFT && tradeAddress) {
      try {
        setIsLoadingModalOpen(true);
        // Clamp and convert gasMultiplier to 50–500 integer
        let multiplier = Math.round(gasMultiplier[0] * 100);
        multiplier = Math.max(50, Math.min(500, multiplier));
        const result = await transferNFTAA(
          aaSigner,
          tradeAddress,
          BigInt(selectedNFT.tokenId),
          0, // Sponsored (gasless)
          '', // No token needed for sponsored
          { gasMultiplier: multiplier }
        );
        toast({
          title: "NFT Sent",
          description: (
            <span>
              NFT sent successfully!{' '}
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
        setModalOpen(false);
        // Reload NFTs to reflect the transfer
        loadNFTs();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Error",
          description: "Failed to send NFT: " + errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingModalOpen(false);
      }
    }
  };

  return (
    <Layout>
      
    <div className="min-h-screen bg-black text-green-400 font-mono">
      
      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="SENDING NFT"
        description="Please wait while your NFT is being sent as a gift..."
      />
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
              NFT_COLLECTIONS
            </h1>
            <p className="text-green-400 text-lg tracking-wider">
              YOUR MINTED GAMING NFTS
            </p>
          </div>
          <div className="mb-8 flex justify-center">
            {isConnected && (
              <Button onClick={loadNFTs} className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                Refresh
              </Button>
            )}
          </div>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <Button onClick={loadNFTs} className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                Try Again
              </Button>
            </div>
          ) : nfts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-cyan-200 py-12">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 opacity-60">
                <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="2" />
                <path d="M8 12h8M12 8v8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-xl font-bold mb-2">
                {isConnected ? "No NFTs found" : "Wallet not connected"}
              </div>
              <div className="text-green-400 text-base">
                {isConnected
                  ? "You don't have any NFTs yet. Mint your first one!"
                  : "Connect your wallet to view your NFT collections."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <Card key={nft.id || nft.tokenId} className="bg-black border-cyan-400 border-2 overflow-hidden hover:border-green-400 transition-colors group cursor-pointer">
                  <div className="relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      onError={(e) => { e.currentTarget.src = '/placeholder.jpeg'; }}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={`font-mono ${rarityColors[nft.rarity] || rarityColors["Common"]}`}>
                        {nft.rarity || "Common"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2 tracking-wider">
                      {nft.name}
                    </h3>
                    <p className="text-sm text-green-400 mb-4 line-clamp-2">
                      {nft.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-400">ID: {nft.tokenId}</span>
                      <Button
                        size="sm"
                        className="bg-yellow-400 text-black hover:bg-green-400 font-mono text-xs"
                        onClick={() => handleTradeSellSend(nft)}
                      >
                        SEND AS A GIFT
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl neon-text">
              SEND NFT AS GIFT
            </DialogTitle>
            <DialogDescription className="text-green-400">
              Send <span className="text-yellow-400">{selectedNFT?.name}</span> (ID: {selectedNFT?.tokenId}) as a gift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-cyan-400 text-sm font-bold mb-2 block">
                Recipient Address
              </Label>
              <Input
                type="text"
                value={tradeAddress}
                onChange={(e) => setTradeAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-black border-cyan-400 text-green-400"
              />
            </div>
            <div>
              <Label className="text-cyan-400 text-sm font-bold mb-2 block">
                GAS MULTIPLIER: {gasMultiplier[0]}x
              </Label>
              <Slider
                value={gasMultiplier}
                onValueChange={setGasMultiplier}
                max={3}
                min={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-green-400">
                <span>1.0x (SLOW)</span>
                <span>2.0x (FAST)</span>
                <span>3.0x (ULTRA)</span>
              </div>
            </div>
            {!isApproved && (
              <div className="mt-4 flex flex-col items-center space-y-2">
                <Button
                  onClick={handleApproveNFT}
                  disabled={isApproving}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-mono"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      APPROVING...
                    </>
                  ) : (
                    "APPROVE NFT FOR TRANSFER"
                  )}
                </Button>
                {approvalError && (
                  <span className="text-red-400 text-xs">{approvalError}</span>
                )}
                <span className="text-xs text-cyan-400">
                  You must approve before sending this NFT.
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={handleModalClose}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
              disabled={!tradeAddress || !isApproved || isApproving}
            >
              <Gift className="w-4 h-4 mr-2" />
              SEND
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    </Layout>
  );
};

export default Collections;