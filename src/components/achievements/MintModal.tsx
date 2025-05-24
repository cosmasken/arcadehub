import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { mintNFT } from '../../utils/aaUtils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../ui/use-toast';
import { Loader2, ExternalLink, Copy, CheckCircle, XCircle } from 'lucide-react';
import AdvancedSettings from './AdvancedSettings';
import TokenSelector from './TokenSelector';
import TokenApproval from './TokenApproval';
import { useWalletStore } from '../../stores/useWalletStore';
import { useGasPriceStore } from '../../stores/useGasPriceStore';
import { useTokenStore } from '../../stores/useTokenStore';

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
  const { walletState } = useWalletStore();
  const { gasPriceInfo, tokenGasPrices } = useGasPriceStore();
  const [recipientAddress, setRecipientAddress] = useState('');
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

  const [mintStatus, setMintStatus] = useState<string>('');
  const [mintError, setMintError] = useState<string>('');
  const { supportedTokens } = useTokenStore();

  const handleGasMultiplierChange = (multiplier: number) => {
    if (multiplier < 500) {
      setGasMultiplier(500);
      toast.warning('Gas multiplier must be at least 50%');
      return;
    }
    if (multiplier > 500) {
      setGasMultiplier(500);
      toast.warning('Gas multiplier cannot exceed 500%');
      return;
    }
    setGasMultiplier(multiplier);
  };

  useEffect(() => {
    if (walletState.isConnected) {
      useGasPriceStore.getState().fetchGasPrice(walletState.signer);

      // Set up interval to refresh gas price every 30 seconds
      const interval = setInterval(() => {
        useGasPriceStore.getState().fetchGasPrice(walletState.signer);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [walletState.isConnected]);

  // Fetch token gas prices when tokens are loaded or payment type changes
  useEffect(() => {
    if (supportedTokens.length > 0 && paymentType !== 'SPONSORED') {
      useGasPriceStore.getState().fetchTokenGasPrices(supportedTokens, walletState.signer);
    }
  }, [supportedTokens]);

  const handleMint = async () => {
    if (!recipientAddress) {
      toast({
        title: "Error",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }

    // Basic address validation (simplified)
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      toast({
        title: "Error",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'token' && !selectedToken) {
      toast({
        title: "Error",
        description: "Please select a token for gas payment",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'token' && !tokenApproved) {
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
    
          // Sample NFT metadata URI - In a real app, this would be dynamic
          const metadataUri = 'https://neroapi.com/nfts/metadata/sample';
    
          // Perform mint operation
          const result = await mintNFT(
            walletState.signer,
            recipientAddress,
            metadataUri,
            // paymentType, use 0 for now
            0,
            selectedToken,
            {
              gasMultiplier : gasMultiplier,
            }
          );
    
          setMintStatus('Transaction completed!');
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
              View on Etherscan
            </a>
          </span>
        ),
      });
          onMintSuccess(achievement, result.transactionHash);
          // onMintSuccess(result.transactionHash);
        } catch (error) {
          console.error('Error minting NFT:', error);
          setMintError('Failed to mint NFT. Please try again.');
        //  onMintError(error as Error);
        } finally {
          setIsMinting(false);
        }

 
  };

  const handleClose = () => {
    if (!isMinting) {
      setRecipientAddress('');
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
        description: "Transaction hash copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openEtherscan = (txHash: string) => {
    // Open in new tab - in a real app this would be the actual network explorer
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  if (!achievement) return null;

  const IconComponent = achievement.icon;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-600">
              <IconComponent size={20} />
            </div>
            <span>Mint Achievement NFT</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Mint "{achievement.title}" as an NFT to showcase your gaming achievement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-800/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{achievement.title}</h4>
            <p className="text-sm text-gray-300">{achievement.description}</p>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 rounded text-xs ${achievement.rarity === 'Common' ? 'bg-gray-600' :
                  achievement.rarity === 'Rare' ? 'bg-blue-600' :
                    achievement.rarity === 'Epic' ? 'bg-purple-600' :
                      'bg-yellow-600'
                }`}>
                {achievement.rarity}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              disabled={isMinting}
            />
            <p className="text-sm text-gray-400">
              Enter the Ethereum address where you want to mint this achievement NFT
            </p>
          </div>

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
                <SelectItem value="token" className="text-white hover:bg-gray-700">
                  Pay with Token - Use your tokens for gas fees
                </SelectItem>
              </SelectContent>
            </Select>

            {paymentType === 'token' && (
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
              disabled={isMinting || !recipientAddress || (paymentType === 'token' && (!selectedToken || !tokenApproved))}
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
        {/* ...rest of modal content... */}
        </div>
      </DialogContent>
    </Dialog>
 
    </>
  );
};

export default MintModal;
