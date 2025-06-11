import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import PrizePoolDepositModal from '../components/PrizePoolDepositModal';
import LoadingModal from '../components/LoadingModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ArrowLeft,
  Trophy,
  Coins,
  Calendar,
  Users,
  Target,
  Gamepad2
} from 'lucide-react';
import { createTournamentAA, approveTokenForContractAA } from '../lib/aaUtils';
import { ethers } from 'ethers';
import { TESTNET_CONFIG } from '../config'; // Assuming you have a config file with contract addresses
import { useWalletStore } from '../stores/useWalletStore'; // Adjust the import based on your store structure

const CreateTournament = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { aaSigner } = useWalletStore();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    description: '',
    maxParticipants: 1000,
    duration: 24,
    startDate: '',
    entryFee: 'FREE',
    rules: ''
  });

  const gameOptions = [
    'Crypto Battles',
    'NFT Racing',
    'DeFi Quest',
    'Pixel Warriors',
    'Space Invaders',
    'Honey Clicker'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTournament = () => {
    // Validate form
    if (!formData.title || !formData.game || !formData.startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsDepositModalOpen(true);
  };

  const handlePrizePoolDeposit = async (amount: string
    // , token: string
  ) => {
    // setIsDepositModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      // Get the user's signer (e.g., from MetaMask)

      if (!aaSigner) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }

      // Validate token (assuming ARC token for now)
      // if (token.toLowerCase() !== 'arc') {
      //   throw new Error("Only ARC tokens are supported for prize pools.");
      // }

      // Convert amount to wei (assuming 18 decimals for ARC token)
      const prizePool = ethers.parseUnits(amount, 18);

      // 1. Approve only the required ARC amount for ArcadeHub
      // Approve token for a specific contract using AA
      // export const approveTokenForContractAA = async (
      //   accountSigner: ethers.Signer,
      //   tokenAddress: string,
      //   amount: bigint,
      //   contractAddress: string,
      //   options?: { apiKey?: string; gasMultiplier?: number }
      // ) => {

      const approvalResult = await approveTokenForContractAA(
        aaSigner, TESTNET_CONFIG.smartContracts.arcadeToken,
        prizePool,
        TESTNET_CONFIG.smartContracts.tournamentHub)
      // const approvalResult = await approveArcadeHubArc(aaSigner, prizePool);
      if (!approvalResult || approvalResult.error) {
        throw new Error("Token approval failed. Please try again.");
      }

      // Convert startDate to Unix timestamp (in seconds)
      const startTime = Math.floor(new Date(formData.startDate).getTime() / 1000);

      // Calculate endTime (startTime + duration in hours converted to seconds)
      const endTime = startTime + formData.duration * 3600;
      setIsLoadingModalOpen(true);

      // Create tournament on-chain using Account Abstraction
      const result = await createTournamentAA(
        aaSigner,
        formData.title, // name
        prizePool,      // prizePool
        startTime,      // startTime
        endTime,        // endTime
        0,              // paymentType: sponsored gas
        '',             // selectedToken: none for sponsored gas
      );

      // Check if transaction was successful
      if (!result.userOpHash) {
        throw new Error("Transaction failed. No UserOperation hash returned.");
      }

      setIsLoadingModalOpen(false);

      // toast({
      //   title: "Tournament Created Successfully!",
      //   description: `${formData.title} has been created with ${amount} ARC prize pool. UserOpHash: ${result.userOpHash}`,
      //   className: "bg-green-400 text-black border-green-400",
      // });

      toast({
        title: "Tournament Created Successfully!",
        description: (
          <span>
            <span>Transaction:&nbsp;</span>
            <span>${formData.title} has been created with ${amount} ARC prize pool. UserOpHash: ${result.userOpHash}</span>
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

      // Redirect to dashboard
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
    <div className="min-h-screen bg-black text-green-400">
      <Header />

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
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
                &gt; CREATE_TOURNAMENT &lt;
              </h1>
              <p className="text-green-400 mt-2">
                Set up a new sponsored tournament with custom prize pool
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tournament Form */}
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
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="duration" className="text-green-400 font-mono">
                        DURATION_HOURS
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        className="bg-black border-green-400 text-green-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="startDate" className="text-green-400 font-mono">
                      START_DATE *
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
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

            {/* Summary Sidebar */}
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
                      <span className="text-green-400">Max Players:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.maxParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Duration:</span>
                      <span className="text-cyan-400 font-mono">
                        {formData.duration}H
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

              {/* Benefits Info */}
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
        tournament={formData}
      />

      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="CREATING TOURNAMENT"
        description="Setting up your tournament and depositing prize pool..."
      />
    </div>
  );
};

export default CreateTournament;