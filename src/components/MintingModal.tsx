import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  CreditCard,
  DollarSign,
  Wallet,
  Fuel,
  Zap,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

import TokenSelector from './TokenSelector';
import TokenApproval from './TokenApproval';
import { useWalletStore } from '../stores/useWalletStore';
import { useTokenStore } from '../stores/useTokenStore';
import { useToast } from './ui/use-toast';
import { mintNFT, checkAAWalletTokenAllowance } from '../lib/aaUtils';
import { usePinata } from '../hooks/use-pinata';
import supabase from '../hooks/use-supabase';
import { add } from 'date-fns';
import { TESTNET_CONFIG } from '../config';

interface MintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMintSuccess: (achievement: any, txHash: string) => void;
  achievement: any;
  setIsLoadingModalOpen: (open: boolean) => void;
}

const MintingModal: React.FC<MintingModalProps> = ({
  isOpen,
  onClose,
  onMintSuccess,
  achievement,
  setIsLoadingModalOpen,
}) => {
  const { setTokenApproval } = useTokenStore();
  const { aaSigner, aaWalletAddress } = useWalletStore();
  const [paymentType, setPaymentType] = useState('sponsored');
  const [selectedToken, setSelectedToken] = useState('');
  const [gasMultiplier, setGasMultiplier] = useState([1.5]);
  const [tokenApproved, setTokenApproved] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const { toast } = useToast();
  const { uploadFile } = usePinata();
  const gasMultiplierPercent = Math.round(gasMultiplier[0] * 100 + (gasMultiplier[0] > 1 ? 0 : -50));
  // Clamp to 50–500
  const clampedGasMultiplier = Math.max(50, Math.min(500, gasMultiplierPercent));

  // Check token approval for prepay/postpay
  useEffect(() => {
    const checkApproval = async () => {
      if (
        (paymentType === 'prepay' || paymentType === 'postpay') &&
        selectedToken &&
        aaSigner &&
        aaWalletAddress
      ) {
        const allowance = await checkAAWalletTokenAllowance(aaSigner, selectedToken);
        setTokenApproval(selectedToken, Number(allowance) > 0);
        setTokenApproved(Number(allowance) > 0);
      } else {
        setTokenApproved(false);
      }
    };
    checkApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken, paymentType, aaSigner, aaWalletAddress, isOpen]);

  const handleGasMultiplierChange = (value: number[]) => {
    setGasMultiplier([Math.max(1, Math.min(3, value[0]))]);
  };

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
    setIsLoadingModalOpen(true);

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


      // Upload metadata (simplified, see your old modal for full logic)
      const imageUrl = "https://gateway.pinata.cloud/ipfs/bafybeia6qd3hrkx6jyeudbtwjunfjxxff3swjrtpt25h3cgqc42glfyxla";
      const metadata = {
        name: achievement?.title || "Achievement NFT",
        description: achievement?.longDescription || achievement?.description || "Achievement NFT",
        image: imageUrl,
        attributes: [
          { trait_type: "Rarity", value: achievement?.rarity || "Common" },
          { trait_type: "Game", value: achievement?.game || "ArcadeHub" },
        ],
      };
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
        { gasMultiplier: clampedGasMultiplier }
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

      // Upsert achievement
      await supabase.from('user_achievements').insert([
        {
          user_wallet: aaWalletAddress,
          achievement_id: achievement.id,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
        }
      ]);

      setMintResult({ success: true, txHash: result.transactionHash });
      onMintSuccess(achievement, result.transactionHash);
    } catch (error: any) {
      setMintResult({ success: false, error: error.message || 'Mint error' });
    } finally {
      setIsMinting(false);
      setIsLoadingModalOpen(false);
    }
  };

  const handleClose = () => {
    if (!isMinting) {
      setPaymentType('sponsored');
      setSelectedToken('');
      setTokenApproved(false);
      setGasMultiplier([1.5]);
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

  const paymentOptions = [
    {
      id: 'sponsored',
      label: 'SPONSORED',
      description: 'Platform covers gas fees',
      icon: Zap,
      color: 'text-green-400'
    },
    {
      id: 'prepay',
      label: 'PREPAY',
      description: 'Pay gas fees upfront',
      icon: CreditCard,
      color: 'text-cyan-400'
    },
    {
      id: 'postpay',
      label: 'POSTPAY',
      description: 'Pay gas fees after minting',
      icon: DollarSign,
      color: 'text-yellow-400'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-xl neon-text">
            &gt; MINT_CONFIG &lt;
          </DialogTitle>
          <DialogDescription className="text-green-400">
            Configure your minting parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Type Selection */}
          <div>
            <Label className="text-cyan-400 text-sm font-bold mb-3 block">
              PAYMENT_TYPE:
            </Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
              {paymentOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 border border-cyan-400 p-3 rounded hover:border-green-400 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} className="border-cyan-400" />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <option.icon className={`w-5 h-5 ${option.color}`} />
                      <div>
                        <p className={`font-bold ${option.color}`}>{option.label}</p>
                        <p className="text-xs text-green-400">{option.description}</p>
                      </div>
                    </div>
                  </Label>
                  {option.id === 'sponsored' && (
                    <Badge className="bg-green-400 text-black text-xs">FREE</Badge>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Token Selector & Approval for prepay/postpay */}
          {(paymentType === 'prepay' || paymentType === 'postpay') && (
            <div className="space-y-4 pl-6 border-l-2 border-cyan-400">
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

          {/* Gas Multiplier */}
          <div>
            <Label className="text-cyan-400 text-sm font-bold mb-3 block">
              GAS_MULTIPLIER: {gasMultiplier[0]}x
            </Label>
            <div className="space-y-3">
              <Slider
                value={gasMultiplier}
                onValueChange={handleGasMultiplierChange}
                max={3}
                min={1}
                step={0.1}
                className="w-full"
                disabled={isMinting}
              />
              <div className="flex justify-between text-xs text-green-400">
                <span>1.0x (SLOW)</span>
                <span>2.0x (FAST)</span>
                <span>3.0x (ULTRA)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Fuel className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-green-400">
                Higher multiplier = Faster confirmation
              </span>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="border border-green-400 p-3 rounded bg-black/50">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm">ESTIMATED_COST:</span>
              <span className="text-cyan-400 font-bold">
                {paymentType === 'sponsored'
                  ? 'FREE'
                  : `${(0.002 * gasMultiplier[0]).toFixed(4)} NERO`}
              </span>
            </div>
          </div>

          {/* Mint Result */}
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
                  <p className="text-sm text-green-300">Transaction Hash:</p>
                  <div className="flex items-center space-x-2 p-2 bg-black rounded border">
                    <code className="text-xs text-cyan-400 flex-1 break-all">
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
                  <p className="text-xs text-green-400">
                    Click the external link icon to view on Neroscan
                  </p>
                </div>
              ) : mintResult.error && (
                <p className="text-sm text-red-300">{mintResult.error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            disabled={isMinting}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleMint}
            className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
            disabled={
              isMinting ||
              !aaWalletAddress ||
              ((paymentType === 'prepay' || paymentType === 'postpay') &&
                (!selectedToken || !tokenApproved))
            }
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                MINT_NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MintingModal;