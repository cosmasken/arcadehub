/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { Settings, Coins, Users, Calendar, Trophy, Plus, Edit, Square } from 'lucide-react';
import { useWalletStore } from '../stores/useWalletStore';
import { addFundsAA, forceEndTournamentAA, finalizeTournamentAA } from '../lib/aaUtils';
import { ethers } from 'ethers';
import { decodeError } from '../lib/utils';

interface ManageTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
}

const ManageTournamentModal = ({ isOpen, onClose, tournament }: ManageTournamentModalProps) => {
  const { toast } = useToast();
  const { aaSigner } = useWalletStore();
  const [additionalFunds, setAdditionalFunds] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // ["0x5d0E342cCD1aD86a16BfBa26f404486940DBE345","0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74","0xC86Fed58edF0981e927160C50ecB8a8B05B32fed","0x150E812D3443699e8b829EF6978057Ed7CB47AE6"]

  const tokenOptions = [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'NERO', decimals: 18 },
    { address: '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345', symbol: 'DAI', decimals: 18 },
    { address: '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74', symbol: 'USDT', decimals: 6 },
    { address: '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed', symbol: 'USDC', decimals: 6 },
    { address: '0x150E812D3443699e8b829EF6978057Ed7CB47AE6', symbol: 'ARC', decimals: 18 },
  ];

  if (!tournament) return null;

  const handleAddFunds = async () => {
    if (!additionalFunds || parseFloat(additionalFunds) <= 0 || !selectedToken) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and select a token.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!aaSigner) throw new Error("Wallet not connected.");
      const token = tokenOptions.find(t => t.address === selectedToken);
      const amount = ethers.parseUnits(additionalFunds, token.decimals);
      const result = await addFundsAA(aaSigner, tournament.id, amount, selectedToken, 0);
      toast({
        title: "Funds Added",
        description: (
          <span>
            Added {additionalFunds} {token.symbol} to {tournament.title}.
            <a href={`https://testnet.neroscan.io/tx/${result.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View on Etherscan
            </a>
          </span>
        ),
        className: "bg-green-400 text-black border-green-400"
      });
      setAdditionalFunds('');
      setSelectedToken('');
    } catch (error) {
      toast({
        title: "Add Funds Failed",
        description: decodeError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTournamentAction = async (action) => {
    setIsLoading(true);
    try {
      if (!aaSigner) throw new Error("Wallet not connected.");
      let result;
      if (action === 'end') {
        result = await forceEndTournamentAA(aaSigner, tournament.id, 0);
        toast({
          title: "Tournament Ended",
          description: (
            <span>
              Tournament {tournament.title} ended.
              <a href={`https://testnet.neroscan.io/tx/${result.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View on Etherscan
              </a>
            </span>
          ),
          className: "bg-green-400 text-black border-green-400"
        });
      } else if (action === 'finalize') {
        result = await finalizeTournamentAA(aaSigner, tournament.id, 0);
        toast({
          title: "Tournament Finalized",
          description: (
            <span>
              Prizes for {tournament.title} distributed.
              <a href={`https://testnet.neroscan.io/tx/${result.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View on Etherscan
              </a>
            </span>
          ),
          className: "bg-green-400 text-black border-green-400"
        });
      } else if (action === 'edit') {
        toast({
          title: "Edit Not Supported",
          description: "Editing tournaments is not yet implemented.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast({
        title: `${action} Failed`,
        description: decodeError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-400 text-black animate-pulse">LIVE</Badge>;
      case 'ended':
        return <Badge className="bg-yellow-400 text-black">ENDED</Badge>;
      case 'completed':
        return <Badge className="bg-gray-400 text-black">COMPLETED</Badge>;
      default:
        return <Badge className="bg-cyan-400 text-black">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-green-400 text-green-400 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-xl">
             &gt; MANAGE_TOURNAMENT  &Lt;
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-cyan-400 font-mono">
                  {tournament.title}
                </h2>
                {getStatusBadge(tournament.status)}
              </div>
            </div>
          </div>
          <Card className="bg-black border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                PRIZE_POOL_MANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-400">CURRENT_PRIZE_POOL</Label>
                  <div className="text-2xl font-bold text-yellow-400 font-mono">
                    {tournament.prizePool} {tournament.tokenSymbol}
                  </div>
                </div>
                <div>
                  <Label className="text-green-400">YOUR_CONTRIBUTION</Label>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {tournament.yourContribution} {tournament.tokenSymbol}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalFunds" className="text-green-400">
                  ADD_ADDITIONAL_FUNDS
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="additionalFunds"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={additionalFunds}
                    onChange={(e) => setAdditionalFunds(e.target.value)}
                    className="bg-black border-green-400 text-green-400 font-mono"
                  />
                  <Select onValueChange={setSelectedToken} value={selectedToken}>
                    <SelectTrigger className="bg-black border-green-400 text-green-400 font-mono">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-400">
                      {tokenOptions
                        .filter(t => t.address === tournament.token) // Only allow same token
                        .map(t => (
                          <SelectItem key={t.address} value={t.address} className="text-green-400">
                            {t.symbol}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddFunds}
                    disabled={isLoading || !additionalFunds || !selectedToken}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    ADD
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black border-2 border-cyan-400">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                TOURNAMENT_CONTROLS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tournament.status === 'live' && (
                  <Button
                    onClick={() => handleTournamentAction('end')}
                    disabled={isLoading}
                    className="bg-red-400 text-black hover:bg-red-300 font-mono"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    END
                  </Button>
                )}
                {tournament.status === 'ended' && Math.floor(Date.now() / 1000) >= tournament.distributionTime && (
                  <Button
                    onClick={() => handleTournamentAction('finalize')}
                    disabled={isLoading}
                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    FINALIZE
                  </Button>
                )}
                <Button
                  onClick={() => handleTournamentAction('edit')}
                  disabled={isLoading || tournament.status === 'completed'}
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  EDIT
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black border-2 border-green-400">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                LIVE_STATISTICS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-400 font-mono">
                    {tournament.participants}
                  </div>
                  <div className="text-green-400 text-sm">PARTICIPANTS</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {Math.max(0, Math.floor((tournament.distributionTime - Date.now() / 1000) / 3600))}H
                  </div>
                  <div className="text-green-400 text-sm">TIME_LEFT</div>
                </div>
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-yellow-400 font-mono">
                    #1
                  </div>
                  <div className="text-green-400 text-sm">TRENDING</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono"
            >
              SAVE_CHANGES
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            >
              CLOSE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTournamentModal;