import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Coins,
  Trophy,
  Shield,
  Zap,
  Heart,
  Gift
} from 'lucide-react';
import { useWalletStore } from '../stores/useWalletStore';
import { TESTNET_CONFIG } from '../config';
import { ethers } from 'ethers';
import { getProvider } from '../lib/aaUtils';
import TokenApproval from './TokenApproval';
import { checkAAWalletTokenAllowance } from '../lib/aaUtils';


const tokenSymbols = {
  '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345': 'DAI',
  '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74': 'USDT',
  '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed': 'USDC',
  '0x150E812D3443699e8b829EF6978057Ed7CB47AE6': 'ARC',
};

const supportedTokens = Object.entries(tokenSymbols).map(([address, symbol]) => ({ address, symbol }));


interface Tournament {
  title: string;
  game: string;
  maxParticipants: number;
  prizePool?: string;
  token?: string;
  description?: string;
  entryFee?: string;
  rules?: string;
}

const ARC_TOKEN_ADDRESS = TESTNET_CONFIG.smartContracts.arcadeToken;

interface PrizePoolDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (
    amount: string,
    gasMultiplier?: number
    //  token: string
  ) => void;
  tournament: Tournament;

}

const PrizePoolDepositModal: React.FC<PrizePoolDepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  tournament
}) => {

  const [amount, setAmount] = useState('');
  const { aaWalletAddress, aaSigner } = useWalletStore();
  const [balance, setBalance] = useState('0');
  const [selectedToken, setSelectedToken] = useState(supportedTokens[0].address);
  const [allowance, setAllowance] = useState('0');
  const [arcApproved, setArcApproved] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);


  // Fetch balance for selected token
  useEffect(() => {
    const getUserTokenBalance = async () => {
        setIsCheckingAllowance(true);
      try {
        if (!aaWalletAddress || !selectedToken) {
          setBalance('0');
          return;
        }
        // if (selectedToken === '0x0000000000000000000000000000000000000000') {
        //   // Native token (NERO)
        //   const provider = getProvider();
        //   const bal = await provider.getBalance(aaWalletAddress);
        //   setBalance(ethers.formatUnits(bal, 18));
        // } else {
          // ERC20 token
          const provider = getProvider();
          const contract = new ethers.Contract(
            selectedToken,
            ['function balanceOf(address) external view returns (uint256)'],
            provider
          );
          const bal = await contract.balanceOf(aaWalletAddress);
          setBalance(ethers.formatUnits(bal, 18));
        // }
      } catch {
        setBalance('0');
      } finally {
        setIsCheckingAllowance(false);
      }
    };
    getUserTokenBalance();
  }, [aaWalletAddress, selectedToken]);

  // Check allowance for selected token and amount
  useEffect(() => {
    const fetchAllowance = async () => {
      if (aaSigner && selectedToken && aaWalletAddress && amount) {
        const allowanceStr = await checkAAWalletTokenAllowance(aaSigner, selectedToken);
        setAllowance(allowanceStr);
        setArcApproved(Number(amount) <= Number(allowanceStr));
      } else {
        setArcApproved(false);
      }
    };
    fetchAllowance();
  }, [aaSigner, selectedToken, aaWalletAddress, amount]);


  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onDeposit(amount);
    setAmount('');
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-2 border-yellow-400 text-green-400 font-mono max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl neon-text flex items-center">
            <Coins className="w-5 h-5 mr-2" />
             DEPOSIT_PRIZE_POOL 
          </DialogTitle>
          <DialogDescription className="text-green-400">
            Fund the prize pool for {tournament.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Info */}
          <div className="border border-yellow-400 p-4 rounded bg-black/50">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-yellow-400 font-bold">TOURNAMENT DETAILS</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-green-400">
                <span className="text-cyan-400">Title:</span> {tournament.title}
              </p>
              <p className="text-green-400">
                <span className="text-cyan-400">Game:</span> {tournament.game}
              </p>
              <p className="text-green-400">
                <span className="text-cyan-400">Max Players:</span> {tournament.maxParticipants}
              </p>
            </div>
          </div>

          {/* Sponsored Info */}
          <div className="bg-gradient-to-r from-purple-400/10 to-pink-400/10 border border-purple-400 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Gift className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold text-purple-400">
                SPONSORED DEPOSIT
              </span>
            </div>
            <div className="text-center space-y-2">
              <p className="text-green-400 text-sm">
                This deposit is sponsored by:
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
                  FREE FOR ALL SPONSORS
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-cyan-400 font-bold mb-1">Token</label>
            <select
              className="w-full bg-black border-2 border-green-400 text-green-400 px-3 py-2 rounded font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={selectedToken}
              onChange={e => setSelectedToken(e.target.value)}
            >
              {supportedTokens.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-cyan-400 font-bold">
              DEPOSIT_AMOUNT:
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black border-green-400 text-green-400 font-mono pr-16"
              />
            </div>

            <p className="text-green-400 text-xs">
              Available balance: {balance} ARC
            </p>

          </div>


          {!arcApproved && (
            <TokenApproval
              selectedToken={selectedToken}
              onApprovalComplete={() => setArcApproved(true)}
            />
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-cyan-400 font-bold text-sm">QUICK_AMOUNTS:</Label>
            <div className="grid grid-cols-4 gap-2">
              {['1000', '5000', '10000', '25000'].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>


          {/* Security Info */}
          <div className="border border-green-400 p-3 rounded bg-green-400/10">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <h4 className="text-green-400 font-bold text-sm">SECURITY_GUARANTEE</h4>
            </div>
            <ul className="space-y-1 text-xs text-green-400">
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Funds locked in smart contract</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Automatic prize distribution</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>On-chain score verification</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0 || isCheckingAllowance}
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coins className="w-4 h-4 mr-2" />
            DEPOSIT {amount} ARC
            {/* {selectedToken} */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrizePoolDepositModal;
