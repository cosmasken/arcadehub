import React, { useState, useEffect, useCallback } from "react";
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWalletStore } from "../stores/useWalletStore";
import { getNFTs } from "../lib/aaUtils";
import MintingModal from '../components/MintingModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Slider } from '../components/ui/slider';
import { Wallet, Gift, ArrowRightLeft, DollarSign } from 'lucide-react';
import LoadingModal from '../components/LoadingModal';
import {transferNFTAA,approveNFTForArcadeHub} from '../lib/aaUtils';
import { TESTNET_CONFIG } from '../config';

const tradeTypes = [
  // { id: 'sell', label: 'Sell', icon: DollarSign },
  // { id: 'trade', label: 'Trade', icon: ArrowRightLeft },
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
  const { isConnected, aaWalletAddress ,aaSigner } = useWalletStore();
  const [nfts, setNfts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [tradeType, setTradeType] = useState('sell');
  const [tradeAddress, setTradeAddress] = useState('');
  const [tradeNFT, setTradeNFT] = useState('');
  const [price, setPrice] = useState('');
  const [paymentType, setPaymentType] = useState('sponsored');
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [gasMultiplier, setGasMultiplier] = useState([1.5]);
    const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const loadNFTs = useCallback(async () => {
    if (!isConnected || !aaWalletAddress) {
      setNfts([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const fetchedNFTs = await getNFTs(aaWalletAddress);
      setNfts(fetchedNFTs);
    } catch (err) {
      setError("Failed to load NFTs. Please try again later.");
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

  const handleTradeSellSend = (nft: any) => {
    setSelectedNFT(nft);
    setModalOpen(true);
    setTradeType('send');
    setTradeAddress('');
    setTradeNFT('');
    setPrice('');
    setPaymentType('sponsored');
    setGasMultiplier([1.5]);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNFT(null);
  };

  const handleConfirm = async ()  => {
       if (tradeType === 'send' && selectedNFT && tradeAddress) {
      try {
        setIsLoadingModalOpen(true);
        // Clamp and convert gasMultiplier to 50–500 integer
        let multiplier = Math.round(gasMultiplier[0] * 100);
        multiplier = Math.max(50, Math.min(500, multiplier));
         await transferNFTAA(
          aaSigner,
          tradeAddress,
          BigInt(selectedNFT.tokenId),
          paymentType === 'sponsored' ? 0 : paymentType === 'prepayment' ? 1 : 2,
          '', // selectedToken (not needed for sponsored)
          { gasMultiplier: multiplier }
        );
        // Optionally show a toast for success
      } catch (err) {
        // Optionally show a toast for error
        console.error(err);
      } finally {
        setIsLoadingModalOpen(false);
      }
    }
    setModalOpen(false);
  };

   // Check approval when modal opens or selectedNFT changes
  useEffect(() => {
    const checkApproval = async () => {
      setApprovalError(null);
      setIsApproved(false);
      if (selectedNFT && aaSigner && aaWalletAddress) {
        try {
          const nftContractAddress = TESTNET_CONFIG.contracts.arcadeNFTContract;
          const operatorAddress = TESTNET_CONFIG.contracts.arcadeHub;
          const nftContract = new (window as any).ethers.Contract(
            nftContractAddress,
            ["function isApprovedForAll(address owner, address operator) view returns (bool)"],
            aaSigner
          );
          const approved = await nftContract.isApprovedForAll(aaWalletAddress, operatorAddress);
          setIsApproved(approved);
        } catch (err) {
          setApprovalError("Failed to check NFT approval");
        }
      }
    };
    checkApproval();
  }, [selectedNFT, aaSigner, aaWalletAddress, modalOpen]);

  // Approve handler
  const handleApproveNFT = async () => {
    if (!aaSigner) {
    setApprovalError("Wallet not connected. Please connect your wallet.");
    return;
  }
    setIsApproving(true);
    setApprovalError(null);
     setIsLoadingModalOpen(true);
    try {
      const nftContractAddress = TESTNET_CONFIG.contracts.arcadeNFTContract;
      const operatorAddress = TESTNET_CONFIG.contracts.arcadeHub;
      const result = await approveNFTForArcadeHub(aaSigner, nftContractAddress, operatorAddress);
      if (result.success) {
        setIsApproved(true);
      } else {
        setApprovalError("Approval failed. Please try again.");
      }
    } catch (err) {
      setApprovalError("Approval failed. Please try again.");
    } finally {
      setIsApproving(false);
       setIsLoadingModalOpen(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <Header />
      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="SENDING NFT"
        description="Please wait while your NFT is being sent as a gift..."
      />
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
              &gt; NFT_COLLECTIONS &lt;
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
                {isConnected
                  ? "No NFTs found"
                  : "Wallet not connected"}
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
      {/* Trade/Sell/Send Modal */}
   <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl neon-text">
              &gt; SEND NFT AS GIFT &lt;
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
          onChange={e => setTradeAddress(e.target.value)}
          placeholder="0x..."
          className="w-full bg-black border-cyan-400 text-green-400"
        />
      </div>
      <div>
        <Label className="text-cyan-400 text-sm font-bold mb-2 block">
          Payment Type
        </Label>
        <RadioGroup
          value={paymentType}
          onValueChange={setPaymentType}
          className="flex flex-row space-x-4"
        >
          <RadioGroupItem value="sponsored" id="sponsored" />
          <Label htmlFor="sponsored" className="mr-4">Sponsored</Label>
          <RadioGroupItem value="prepayment" id="prepayment" />
          <Label htmlFor="prepayment" className="mr-4">Prepay</Label>
          <RadioGroupItem value="postpayment" id="postpayment" />
          <Label htmlFor="postpayment">Postpay</Label>
        </RadioGroup>
      </div>
            <div>
              <Label className="text-cyan-400 text-sm font-bold mb-2 block">
                GAS MULTIPLIER: {gasMultiplier[0]}x
              </Label>
              <Slider
                value={gasMultiplier}
                onValueChange={setGasMultiplier}
                max={5}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-green-400">
                <span>0.5x (SLOW)</span>
                <span>2.5x (FAST)</span>
                <span>5.0x (ULTRA)</span>
              </div>
            </div>
            {/* NFT Approval UI */}
            {!isApproved && (
              <div className="mt-4 flex flex-col items-center space-y-2">
                <Button
                  onClick={handleApproveNFT}
                  disabled={isApproving}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-mono"
                >
                  {isApproving ? "APPROVING..." : "APPROVE NFT FOR TRANSFER"}
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
              disabled={!tradeAddress || !isApproved}
            >
              CONFIRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collections;