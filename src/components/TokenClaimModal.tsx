import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { useToast } from '../hooks/use-toast';
import { submitPointsClaimSponsored } from '../lib/aaUtils'
import { CheckCircle, XCircle } from 'lucide-react';

import {
  Coins, 
  Sparkles, 
  Gift,
  Heart,
  Zap
} from 'lucide-react';

interface TokenClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimableTokens: number;
  honeyToSpend: number;
  onClaim: () => void;
}

const TokenClaimModal: React.FC<TokenClaimModalProps> = ({
  isOpen,
  onClose,
  claimableTokens,
  honeyToSpend,
  onClaim
}) => {

  const { aaSigner } = useWalletStore();
const { toast } = useToast();
const [isClaiming, setIsClaiming] = useState(false);
const [claimResult, setClaimResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);

const handleClaim = async () => {
  if (!aaSigner) {
    toast({
      title: "Error",
      description: "AA wallet signer not available. Please connect your wallet.",
      variant: "destructive",
    });
    return;
  }
  setIsClaiming(true);
  setClaimResult(null);
  try {
    const result = await submitPointsClaimSponsored(aaSigner, honeyToSpend);
    toast({
      title: "Claim Submitted!",
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
    setClaimResult({ success: true, txHash: result.transactionHash });
    onClaim?.(); // Call parent handler if provided
  } catch (error: any) {
    setClaimResult({ success: false, error: error.message || "Claim error" });
    toast({
      title: "Claim Failed",
      description: error.message || "There was an error submitting your claim.",
      variant: "destructive",
    });
  } finally {
    setIsClaiming(false);
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-yellow-400 text-green-400 font-mono max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-yellow-400 neon-text">
            <Sparkles className="w-8 h-8 inline-block mr-2" />
            TOKEN CLAIM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Claim Details */}
          <div className="bg-yellow-400/10 border border-yellow-400 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {claimableTokens} HIVE TOKENS
              </span>
            </div>
            <p className="text-green-400 text-sm">
              Converting {honeyToSpend.toLocaleString()} honey
            </p>
          </div>

          {/* Sponsorship Info */}
          <div className="bg-gradient-to-r from-purple-400/10 to-pink-400/10 border border-purple-400 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Gift className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold text-purple-400">
                SPONSORED CLAIM
              </span>
            </div>
            <div className="text-center space-y-2">
              <p className="text-green-400 text-sm">
                This claim is sponsored by:
              </p>
              <div className="flex justify-center space-x-2">
                <Badge className="bg-purple-400 text-black px-3 py-1">
                  🏢 NERO CHAIN
                </Badge>
                <Badge className="bg-blue-400 text-black px-3 py-1">
                  ⚡ SHA254 LABS
                </Badge>
              </div>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs text-cyan-400">
                  FREE FOR ALL PLAYERS
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-green-400/10 border border-green-400 rounded-lg p-4">
            <h4 className="text-green-400 font-bold text-center mb-2">
              CLAIM BENEFITS:
            </h4>
            <ul className="text-xs space-y-1">
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Instant token transfer</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>No gas fees required</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Sponsored by our partners</span>
              </li>
            </ul>
            {claimResult && (
        <div className={`p-4 rounded-lg border ${claimResult.success
          ? 'bg-green-900/20 border-green-600'
          : 'bg-red-900/20 border-red-600'
          }`}>
          <div className="flex items-center space-x-2 mb-2">
            {claimResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-semibold">
              {claimResult.success ? 'Claim Submitted!' : 'Claim Failed'}
            </span>
          </div>
          {claimResult.success && claimResult.txHash ? (
            <div className="space-y-2">
              <p className="text-sm text-green-300">Transaction Hash:</p>
              <div className="flex items-center space-x-2 p-2 bg-black rounded border">
                <code className="text-xs text-cyan-400 flex-1 break-all">
                  {claimResult.txHash}
                </code>
               
                <a
                  href={`https://testnet.neroscan.io/tx/${claimResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Neroscan
                </a>

              </div>
              <p className="text-xs text-green-400">
                Click the hash to view on Neroscan
              </p>
            </div>
          ) : claimResult.error && (
            <p className="text-sm text-red-300">{claimResult.error}</p>
          )}
        </div>
      )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800 font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleClaim}
              disabled={isClaiming || !aaSigner}
              className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 font-mono font-bold"
            >
              <Gift className="w-4 h-4 mr-2" />
               {isClaiming ? "CLAIMING..." : `CLAIM FREE ${claimableTokens} Tokens`}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500">
            * Thanks to our sponsors, all token claims are free!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenClaimModal;

