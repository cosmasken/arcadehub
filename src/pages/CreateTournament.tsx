import Layout from "../components/Layout";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import PrizePoolDepositModal from '../components/PrizePoolDepositModal';
import LoadingModal from '../components/LoadingModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  ArrowLeft,
  Trophy,
  Coins,
  Users,
  Target,
  Gamepad2
} from 'lucide-react';
import { createTournamentAA, approveTokenForContractAA, getProvider } from '../lib/aaUtils';
import { ethers } from 'ethers';
import { TESTNET_CONFIG } from '../config';
import { useWalletStore } from '../stores/useWalletStore';
// import supabase from '../hooks/use-supabase';

const CreateTournament = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { aaSigner, aaWalletAddress } = useWalletStore();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    description: '',
    maxParticipants: 1000,
    entryFee: 'FREE',
    rules: '',
    prizePool: '', // New field for prize pool amount
    token: TESTNET_CONFIG.smartContracts.arcadeToken // Default to ARC token
  });

  const gameOptions = ['Honey Clicker'];
  const tokenOptions = [
    { address: TESTNET_CONFIG.smartContracts.arcadeToken, symbol: 'ARC' },
    { address: '0x0000000000000000000000000000000000000000', symbol: 'NERO' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTournament = () => {
    if (!formData.title || !formData.game || !formData.prizePool || parseFloat(formData.prizePool) <= 0 || !ethers.isAddress(formData.token)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including a valid prize pool and token.",
        variant: "destructive",
      });
      return;
    }
    setIsDepositModalOpen(true);
  };

  const handlePrizePoolDeposit = async (amount: string) => {
    setIsLoadingModalOpen(true);

    try {
      if (!aaSigner || !aaWalletAddress) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }

      const decimals = formData.token === '0x0000000000000000000000000000000000000000' ? 18 : 18; // ARC and NERO both use 18 decimals
      const prizePool = ethers.parseUnits(amount, decimals);

      // Approve token if not NERO
      if (formData.token !== '0x0000000000000000000000000000000000000000') {
        const approvalResult = await approveTokenForContractAA(
          aaSigner,
          formData.token,
          prizePool,
          TESTNET_CONFIG.smartContracts.tournamentHub
        );
        
        if (!approvalResult || approvalResult.error) {
          throw new Error(`Token approval failed: ${approvalResult?.error || 'Unknown error'}`);
        }
      }

      // Create tournament
      const result = await createTournamentAA(
        aaSigner,
        formData.title,
        prizePool,
        formData.token, // Pass valid token address
        0 // paymentType: sponsored gas
      );

      if (!result.userOpHash) {
        throw new Error("Transaction failed. No UserOperation hash returned.");
      }

      // Extract tournament ID from logs
      let tournamentId = null;
      const iface = new ethers.Interface([
        "event TournamentCreated(uint256 indexed id, address indexed creator, uint256 prizePool, address token, uint256 startTime, uint256 endTime)"
      ]);

      let logs = [];
      if (result.receipt && Array.isArray(result.receipt.logs)) {
        logs = result.receipt.logs;
      } else if (result.receipt && result.receipt.receipt && Array.isArray(result.receipt.receipt.logs)) {
        logs = result.receipt.receipt.logs;
      }

      if (logs.length > 0) {
        for (const log of logs) {
          try {
            if (log.address.toLowerCase() !== TESTNET_CONFIG.smartContracts.tournamentHub.toLowerCase()) continue;
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "TournamentCreated") {
              tournamentId = parsed.args.id.toString();
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!tournamentId && result.transactionHash && result.receipt && result.receipt.blockNumber) {
        const provider = getProvider();
        const fetchedLogs = await provider.getLogs({
          address: TESTNET_CONFIG.smartContracts.tournamentHub,
          fromBlock: result.receipt.blockNumber,
          toBlock: result.receipt.blockNumber,
          topics: [ethers.id("TournamentCreated(uint256,address,uint256,address,uint256,uint256)")]
        });
        if (fetchedLogs.length > 0) {
          const parsed = iface.parseLog(fetchedLogs[0]);
          tournamentId = parsed.args.id.toString();
        }
      }

      if (!tournamentId) {
        throw new Error("Could not fetch tournament ID from transaction logs.");
      }

      // // Insert into Supabase
      // const { error: supabaseError } = await supabase.from('tournaments').insert({
      //   id: tournamentId,
      //   title: formData.title,
      //   game_id: formData.game, // Verify this matches Supabase schema
      //   description: formData.description,
      //   sponsor_id: aaWalletAddress,
      //   max_participants: formData.maxParticipants,
      //   rules: formData.rules,
      //   image_url: null
      // });

      // if (supabaseError) {
      //   throw new Error(`Supabase insert failed: ${supabaseError.message}`);
      // }

      setIsLoadingModalOpen(false);

      toast({
        title: "Tournament Created Successfully!",
        description: (
          <span>
            <span>{formData.title} has been created with {amount} {formData.token === TESTNET_CONFIG.smartContracts.arcadeToken ? 'ARC' : 'NERO'} prize pool. UserOpHash: {result.userOpHash}</span>
            <a
              href={`https://testnet.neroscan.io/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Sepolia Etherscan
            </a>
          </span>
        ),
      });

      setTimeout(() => {
        navigate('/sponsor/dashboard');
      }, 1500);

    } catch (error) {
      setIsDepositModalOpen(false);
      setIsLoadingModalOpen(false);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create tournament. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating tournament:", error);
    }
  };

  return (
    <Layout>
      
    <div className="min-h-screen bg-black text-green-400">
      

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center space-x-4 mb-8">
            <Button
              onClick={() => navigate('/sponsor/dashboard')}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <div>
              <h1 className="text-3xl font-mono font-bold text-cyan-400 neon-text">
                 CREATE_TOURNAMENT 
              </h1>
              <p className="text-green-400 mt-2">
                Set up a new sponsored tournament with custom prize pool
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-black border-2 border-green-400">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    BASIC_INFORMATION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-green-400 font-mono">
                      TOURNAMENT_TITLE *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-black border-green-400 text-green-400 font-mono"
                      placeholder="Enter tournament title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="game" className="text-green-400 font-mono">
                      GAME_SELECTION *
                    </Label>
                    <Select value={formData.game} onValueChange={(value) => handleInputChange('game', value)}>
                      <SelectTrigger className="bg-black border-green-400 text-green-400 font-mono">
                        <SelectValue placeholder="Select a game..." />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-400">
                        {gameOptions.map((game) => (
                          <SelectItem key={game} value={game} className="text-green-400 font-mono">
                            {game}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-green-400 font-mono">
                      DESCRIPTION
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="bg-black border-green-400 text-green-400 font-mono"
                      placeholder="Describe your tournament..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prizePool" className="text-green-400 font-mono">
                      PRIZE_POOL *
                    </Label>
                    <Input
                      id="prizePool"
                      type="number"
                      step="0.01"
                      value={formData.prizePool}
                      onChange={(e) => handleInputChange('prizePool', e.target.value)}
                      className="bg-black border-green-400 text-green-400 font-mono"
                      placeholder="Enter prize pool amount..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="token" className="text-green-400 font-mono">
                      TOKEN *
                    </Label>
                    <Select value={formData.token} onValueChange={(value) => handleInputChange('token', value)}>
                      <SelectTrigger className="bg-black border-green-400 text-green-400 font-mono">
                        <SelectValue placeholder="Select a token..." />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-400">
                        {tokenOptions.map((token) => (
                          <SelectItem key={token.address} value={token.address} className="text-green-400 font-mono">
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-cyan-400">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    TOURNAMENT_SETTINGS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxParticipants" className="text-green-400 font-mono">
                      MAX_PARTICIPANTS
                    </Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                      className="bg-black border-green-400 text-green-400 font-mono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rules" className="text-green-400 font-mono">
                      TOURNAMENT_RULES
                    </Label>
                    <Textarea
                      id="rules"
                      value={formData.rules}
                      onChange={(e) => handleInputChange('rules', e.target.value)}
                      className="bg-black border-green-400 text-green-400 font-mono"
                      placeholder="Enter tournament rules (one per line)..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-black border-2 border-yellow-400 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-yellow-400 font-mono flex items-center text-sm sm:text-lg">
                    <Coins className="w-5 h-5" />
                    TOURNAMENT_SUMMARY
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-400">Title:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.title || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Game:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.game || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Prize Pool:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.prizePool || '0'} {formData.token === TESTNET_CONFIG.smartContracts.arcadeToken ? 'ARC' : 'NERO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Max Players:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.maxParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Entry Fee:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.entryFee}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-yellow-400 pt-4">
                    <Button
                      onClick={handleCreateTournament}
                      className="w-full bg-yellow-400 text-black hover:bg-green-400 font-mono"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      CREATE & FUND
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-sm">
                    SPONSOR_BENEFITS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-green-400">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Logo prominently displayed</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Custom sponsor messaging</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Transparent prize distribution</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Real-time analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PrizePoolDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handlePrizePoolDeposit}
        tournament={{
          title: formData.title,
          game: formData.game,
          maxParticipants: formData.maxParticipants,
          prizePool: formData.prizePool,
          token: formData.token
        }}
      />

      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="CREATING TOURNAMENT"
        description="Setting up your tournament and depositing prize pool..."
      />
    </div>

    </Layout>
  );
};

export default CreateTournament;