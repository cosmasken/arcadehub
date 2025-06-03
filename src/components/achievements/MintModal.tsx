import React, { useState,useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { mintNFT,checkAAWalletTokenAllowance } from '../../utils/aaUtils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, ExternalLink, Copy, CheckCircle, XCircle } from 'lucide-react';
import AdvancedSettings from './AdvancedSettings';
import TokenSelector from './TokenSelector';
import TokenApproval from './TokenApproval';
import { useWalletStore } from '../../stores/useWalletStore';
import { usePinata } from '../../hooks/use-pinata';
import { useTokenStore } from '../../stores/useTokenStore';
import supabase from '../../hooks/use-supabase';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: any;
  onMintSuccess: (achievement: any, txHash: string) => void;
}

const MintModal: React.FC<MintModalProps> = ({
  isOpen,
  onClose,
  achievement,
  onMintSuccess
}) => {

  const { setTokenApproval } = useTokenStore();
  const { aaSigner, aaWalletAddress,address } = useWalletStore();
  const [paymentType, setPaymentType] = useState('sponsored');
  const [selectedToken, setSelectedToken] = useState('');
  const [gasMultiplier, setGasMultiplier] = useState(100);
  const [tokenApproved, setTokenApproved] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    txHash?: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();
    useEffect(() => {
    const checkApproval = async () => {
      if (
        (paymentType === 'prepay' || paymentType === 'postpay') &&
        selectedToken &&
        aaSigner &&
        aaWalletAddress
      ) {
        const allowance = await checkAAWalletTokenAllowance(
          aaSigner,
          selectedToken
        );
        // Consider approved if allowance is greater than zero
        setTokenApproval(selectedToken, Number(allowance) > 0);
        setTokenApproved(Number(allowance) > 0);
      } else {
        setTokenApproved(false);
      }
    };
    checkApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken, paymentType, aaSigner, aaWalletAddress, isOpen]);

  const upsertMintedAchievement = async (achievementId: number | string) => {
  // You need the user's wallet address, e.g. from a wallet store
  const user_wallet = address; // Replace with your wallet address source
  console.log('inserting achievement for wallet:', user_wallet, 'Achievement ID:', achievementId);
  // Ensure achievementId is valid
  // if (typeof achievementId !== 'number' && typeof achievementId !== 'string') {
  //   console.error('Invalid achievementId:', achievementId);
  //   return;
  // }
  if (!user_wallet || !achievementId) return;
  await supabase.from('user_achievements').insert([
    {
      user_wallet,
      achievement_id: achievementId,
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      // Optionally, add a "minted" field if you want to track NFT minting
      // minted: true,
      // minted_at: new Date().toISOString(),
    }
  ]);
};

  const handleGasMultiplierChange = (multiplier: number) => {
    setGasMultiplier(Math.max(50, Math.min(500, multiplier)));
  };
  const { uploadFile } = usePinata();

  const handleMint = async () => {
    if (!aaWalletAddress) {
      toast({
        title: "Error",
        description: "AA wallet address is not available. Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }
    if ((paymentType === 'prepay' || paymentType === 'postpay') && !selectedToken) {
      toast({
        title: "Error",
        description: "Please select a token for gas payment",
        variant: "destructive",
      });
      return;
    }
    if ((paymentType === 'prepay' || paymentType === 'postpay') && !tokenApproved) {
      toast({
        title: "Error",
        description: "Please approve the token before minting",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    setMintResult(null);

    try {
      if (!aaSigner) {
        toast({
          title: "Error",
          description: "Wallet signer is not available. Please connect your wallet.",
          variant: "destructive",
        });
        setIsMinting(false);
        return;
      }

      // 1. Upload static image to Pinata (if not already uploaded)
      // For demo, use a local image file or a static URL
      // Example: const imageFile = ...; // get File object from assets
      // const imageHash = await uploadFile(imageFile);
      // const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
      // For now, use a static image URL (replace with your uploaded image hash)
      const imageUrl = "https://gateway.pinata.cloud/ipfs/bafybeia6qd3hrkx6jyeudbtwjunfjxxff3swjrtpt25h3cgqc42glfyxla";

      // 2. Construct metadata JSON
      const metadata = {
        name: achievement?.title || "Achievement NFT",
        description: achievement?.longDescription || achievement?.description || "Achievement NFT",
        image: imageUrl,
        attributes: [
          { trait_type: "Rarity", value: achievement?.rarity || "Common" },
          { trait_type: "Game", value: achievement?.game || "ArcadeHub" },
        ],
      };

      // 3. Upload metadata JSON to Pinata
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json");
      const metadataHash = await uploadFile(metadataFile);
      if (!metadataHash) {
        toast({
          title: "Error",
          description: "Failed to upload NFT metadata to IPFS.",
          variant: "destructive",
        });
        setIsMinting(false);
        return;
      }
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

      // 4. Mint NFT with improved metadata
      const paymentTypeNum =
        paymentType === 'sponsored' ? 0 :
        paymentType === 'prepay' ? 1 :
        paymentType === 'postpay' ? 2 : 0;

      const result = await mintNFT(
        aaSigner,
        aaWalletAddress,
        metadataUri,
        paymentTypeNum,
        selectedToken,
        { gasMultiplier }
      );

      toast({
        title: "Mint Successful!",
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
       await upsertMintedAchievement(achievement.id); 
      onMintSuccess(achievement, result.transactionHash);
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      setMintResult({ success: false, error: error.message || 'Mint error' });
    } finally {
      setIsMinting(false);
    }
  };

  const handleClose = () => {
    if (!isMinting) {
      setPaymentType('sponsored');
      setSelectedToken('');
      setTokenApproved(false);
      setGasMultiplier(100);
      setMintResult(null);
      onClose();
    }
  };

  const handleTokenApprovalComplete = () => {
    setTokenApproved(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy transaction hash.",
        variant: "destructive",
      });
    }
  };

  const openEtherscan = (txHash: string) => {
    window.open(`https://testnet.neroscan.io/tx/${txHash}`, '_blank');
  };

  // if (!achievement) return null;

  // const IconComponent = achievement.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-600">
              {/* <IconComponent size={20} /> */}
            </div>
            <span>Mint Achievement NFT</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Mint "{achievement.title}" as an NFT to showcase your gaming achievement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <Select
              value={paymentType}
              onValueChange={setPaymentType}
              disabled={isMinting}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="sponsored" className="text-white hover:bg-gray-700">
                  Sponsored (Free) - Gas fees covered by platform
                </SelectItem>
                <SelectItem value="prepay" className="text-white hover:bg-gray-700">
                  Prepay - Pay upfront with token
                </SelectItem>
                <SelectItem value="postpay" className="text-white hover:bg-gray-700">
                  Postpay - Pay after transaction with token
                </SelectItem>
              </SelectContent>
            </Select>

            {(paymentType === 'prepay' || paymentType === 'postpay') && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                <TokenSelector
                  selectedToken={selectedToken}
                  onTokenSelect={setSelectedToken}
                />

                {selectedToken && (
                  <TokenApproval
                    selectedToken={selectedToken}
                    onApprovalComplete={handleTokenApprovalComplete}
                  />
                )}
              </div>
            )}
          </div>

          <AdvancedSettings
            gasMultiplier={gasMultiplier}
            onGasMultiplierChange={handleGasMultiplierChange}
          />

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isMinting}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={
                isMinting ||
                !aaWalletAddress ||
                ((paymentType === 'prepay' || paymentType === 'postpay') &&
                  (!selectedToken || !tokenApproved))
              }
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint NFT'
              )}
            </Button>
          </div>
          {mintResult && (
            <div className={`p-4 rounded-lg border ${mintResult.success
              ? 'bg-green-900/20 border-green-600'
              : 'bg-red-900/20 border-red-600'
              }`}>
              <div className="flex items-center space-x-2 mb-2">
                {mintResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-semibold">
                  {mintResult.success ? 'Mint Successful!' : 'Mint Failed'}
                </span>
              </div>
              {mintResult.success && mintResult.txHash ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Transaction Hash:</p>
                  <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded border">
                    <code className="text-xs text-blue-400 flex-1 break-all">
                      {mintResult.txHash}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(mintResult.txHash!)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEtherscan(mintResult.txHash!)}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Click the external link icon to view on Etherscan
                  </p>
                </div>
              ) : mintResult.error && (
                <p className="text-sm text-red-300">{mintResult.error}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MintModal;