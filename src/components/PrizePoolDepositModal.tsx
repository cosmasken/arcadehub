import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Coins,
  Trophy,
  Shield,
  Zap
} from 'lucide-react';

interface Tournament {
  title: string;
  game: string;
  maxParticipants: number;
}

interface PrizePoolDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: string, token: string) => void;
  tournament: Tournament;
}

const PrizePoolDepositModal: React.FC<PrizePoolDepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  tournament
}) => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');

  const tokenOptions = [
    { symbol: 'ETH', name: 'Ethereum', balance: '5.234' },
    { symbol: 'USDC', name: 'USD Coin', balance: '12,500.00' },
    { symbol: 'USDT', name: 'Tether', balance: '8,750.50' },
    { symbol: 'DAI', name: 'Dai Stablecoin', balance: '3,200.75' }
  ];

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    onDeposit(amount, selectedToken);
    setAmount('');
    setSelectedToken('ETH');
  };

  const handleClose = () => {
    setAmount('');
    setSelectedToken('ETH');
    onClose();
  };

  const selectedTokenData = tokenOptions.find(token => token.symbol === selectedToken);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-2 border-yellow-400 text-green-400 font-mono max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl neon-text flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            &gt; DEPOSIT_PRIZE_POOL &lt;
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

          {/* Token Selection */}
          <div className="space-y-3">
            <Label htmlFor="token" className="text-cyan-400 font-bold">
              SELECT_TOKEN:
            </Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-black border-green-400 text-green-400 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-400">
                {tokenOptions.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol} className="text-green-400 font-mono">
                    <div className="flex items-center justify-between w-full">
                      <span>{token.symbol} - {token.name}</span>
                      <span className="text-cyan-400 ml-4">Balance: {token.balance}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-mono">
                {selectedToken}
              </div>
            </div>
            {selectedTokenData && (
              <p className="text-green-400 text-xs">
                Available balance: {selectedTokenData.balance} {selectedToken}
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-cyan-400 font-bold text-sm">QUICK_AMOUNTS:</Label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '5', '10', '25'].map((quickAmount) => (
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
            disabled={!amount || parseFloat(amount) <= 0}
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coins className="w-4 h-4 mr-2" />
            DEPOSIT {amount} {selectedToken}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrizePoolDepositModal;
