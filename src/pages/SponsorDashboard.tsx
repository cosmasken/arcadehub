import Layout from "../components/Layout";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Trophy, Coins, Users, Eye, Calendar, BarChart3, Settings, Target } from 'lucide-react';
import { ethers } from 'ethers';
import ViewTournamentModal from '../components/ViewTournamentModal';
import ManageTournamentModal from '../components/ManageTournamentModal';
import useWalletStore from '../stores/useWalletStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  getUserCreatedTournaments,
  getTournamentInfo,
  forceEndTournamentAA,
  finalizeTournamentAA,
  getProvider,
  listenForTournamentEvents,
  isTokenAllowed,
  checkAAWalletTokenAllowance
} from '../lib/aaUtils';
import { TESTNET_CONFIG } from '../config';
import { decodeError } from '../lib/utils';
import TournamentHubABI from '../abi/TournamentHub.json';
import LoadingModal from '../components/LoadingModal';


const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTournaments, setActiveTournaments] = useState([]);
  const { aaWalletAddress, aaSigner } = useWalletStore();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState<string>('Loading Game');
  const [loadingDescription, setLoadingDescription] = useState<string>('Please wait while we load the game...');
  const [loadingTransactionText, setLoadingTransactionText] = useState<string>('Loading...');
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [sponsorStats, setSponsorStats] = useState({
    totalSponsored: "0.00",
    activeTournaments: 0,
    totalPlayers: 0,
    completedTournaments: 0
  });



  const tokenDecimals = {
    '0x0000000000000000000000000000000000000000': 18, // NERO
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6, // USDC (Sepolia address)
    // Add ARC, DAI, etc.
  };


  const tokenSymbols = {
    '0x0000000000000000000000000000000000000000': 'NERO',
    '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345': 'DAI',
    '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74': 'USDT',
    '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed': 'USDC',
    '0x150E812D3443699e8b829EF6978057Ed7CB47AE6': 'ARC',
  };

  React.useEffect(() => {
    const fetchTournaments = async () => {
      if (!aaWalletAddress) return;
      const provider = getProvider();
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        TournamentHubABI,
        provider
      );
      // 1. Get tournament IDs created by this user
      const ids: number[] = await contract.getUserCreatedTournaments(aaWalletAddress);
      // 2. Fetch info for each tournament
      const tournaments = await Promise.all(
        ids.map(async (id) => {
          const info = await contract.getTournamentInfo(id, aaWalletAddress);
          return {
            id: Number(info.id),
            title: info.name,
            game: info.game || '',
            prizePool: ethers.formatEther(info.prizePool),
            participants: info.participants.length,
            status: info.isActive ? 'live' : (info.prizesDistributed ? 'completed' : 'upcoming'),
            startDate: new Date(Number(info.startTime) * 1000).toISOString().slice(0, 10),
            yourContribution: ethers.formatEther(info.prizePool),
          };
        })

      );
      setActiveTournaments(tournaments);
    };
    fetchTournaments();
  }, [aaWalletAddress]);


  const handleViewTournament = (tournament) => {
    setSelectedTournament(tournament);
    setIsViewModalOpen(true);
  };

  const handleManageTournament = (tournament) => {
    setSelectedTournament(tournament);
    setIsManageModalOpen(true);
  };

  const handleManageFromView = () => {
    setIsViewModalOpen(false);
    setIsManageModalOpen(true);
  };

  const handleDistribute = async (tournament) => {
    try {
      setIsLoadingModalOpen(true);
      setLoadingTitle("Distributing Prizes");
      setLoadingDescription("Please wait while we distribute the prizes...");
      setLoadingTransactionText("Distributing...");
      if (!aaSigner) throw new Error("Wallet not connected.");
      const result = await forceEndTournamentAA(aaSigner, tournament.id, 0);
      toast({
        title: "Tournament Ended",
        description: (
          <span>
            Tournament {tournament.title} ended. Dispute period started.
            <a href={`https://testnet.neroscan.io/tx/${result.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View on Etherscan
            </a>
          </span>
        ),
        className: "bg-green-400 text-black border-green-400"
      });
      setActiveTournaments(prev =>
        prev.map(t =>
          t.id === tournament.id ? { ...t, status: 'ended', distributionTime: Math.floor(Date.now() / 1000) + 120 } : t
        )
      );
    } catch (error) {
      toast({
        title: "End Failed",
        description: decodeError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoadingModalOpen(false);
      setLoadingTitle("");
      setLoadingDescription("");
      setLoadingTransactionText("");
    }
  };

  const handleFinalizeTournament = async (tournament) => {
    try {
      setIsLoadingModalOpen(true);
      setLoadingTitle("Finalizing Tournament");
      setLoadingDescription("Calculating winners");
      setLoadingTransactionText("Finalizing...");

      if (!aaSigner) throw new Error("Wallet not connected.");
      const result = await finalizeTournamentAA(aaSigner, tournament.id, 0);
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
      setActiveTournaments(prev =>
        prev.map(t =>
          t.id === tournament.id ? { ...t, status: 'completed' } : t
        )

      );
    } catch (error) {
      toast({
        title: "Finalize Failed",
        description: decodeError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoadingModalOpen(false);
      setLoadingTitle("");
      setLoadingDescription("");
      setLoadingTransactionText("");
    }
  };

  return (
    <Layout>

      <div className="min-h-screen bg-black text-green-400">

        <main className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-mono font-bold text-cyan-400 neon-text">
                  SPONSOR_DASHBOARD
                </h1>
                <p className="text-green-400 mt-2">
                  Welcome back, {aaWalletAddress ? `${aaWalletAddress.slice(0, 6)}...${aaWalletAddress.slice(-4)}` : 'SPONSOR_001'}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate('/sponsor/analytics')}
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black font-mono"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  ANALYTICS
                </Button>
                <Button
                  onClick={() => navigate('/sponsor/create-tournament')}
                  className="bg-yellow-400 text-black hover:bg-green-400 font-mono"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE_TOURNAMENT
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black border-2 border-yellow-400 text-center">
                <CardContent className="p-4">
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400 font-mono">
                    {sponsorStats.totalSponsored} NERO
                  </div>
                  <div className="text-green-400 text-sm">TOTAL_SPONSORED</div>
                </CardContent>
              </Card>
              <Card className="bg-black border-2 border-cyan-400 text-center">
                <CardContent className="p-4">
                  <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {sponsorStats.activeTournaments}
                  </div>
                  <div className="text-green-400 text-sm">ACTIVE_TOURNAMENTS</div>
                </CardContent>
              </Card>
              <Card className="bg-black border-2 border-green-400 text-center">
                <CardContent className="p-4">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {sponsorStats.totalPlayers}
                  </div>
                  <div className="text-green-400 text-sm">TOTAL_PLAYERS</div>
                </CardContent>
              </Card>
              <Card className="bg-black border-2 border-gray-400 text-center">
                <CardContent className="p-4">
                  <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-400 font-mono">
                    {sponsorStats.completedTournaments}
                  </div>
                  <div className="text-green-400 text-sm">COMPLETED</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-mono text-cyan-400 mb-4">
                ACTIVE TOURNAMENTS
              </h2>
              <div className="space-y-4">
                {activeTournaments.map((tournament) => (
                  <Card key={tournament.id} className="bg-black border-2 border-green-400">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-cyan-400 font-mono font-bold text-lg">
                              {tournament.title} (ID: {tournament.id})
                            </h3>
                            <Badge className={`font-mono ${tournament.status === 'live'
                              ? 'bg-green-400 text-black animate-pulse'
                              : tournament.status === 'ended'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-400 text-black'
                              }`}>
                              {tournament.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400">Prize: {tournament.prizePool} {tournament.tokenSymbol}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">{tournament.participants} players</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span className="text-cyan-400">{tournament.startTime}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-yellow-400 text-sm font-mono">
                              Your contribution: {tournament.yourContribution} {tournament.tokenSymbol}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                            disabled={tournament.status !== 'live'}
                            onClick={() => handleDistribute(tournament)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            DISTRIBUTE
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                            disabled={tournament.status !== 'ended' || Math.floor(Date.now() / 1000) < tournament.distributionTime}
                            onClick={() => handleFinalizeTournament(tournament)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            END TOURNAMENT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                            onClick={() => handleViewTournament(tournament)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            VIEW
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                            onClick={() => handleManageTournament(tournament)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            MANAGE
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="text-yellow-400 font-mono flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    CREATE_NEW_TOURNAMENT
                  </CardTitle>
                  <CardDescription className="text-green-400">
                    Set up a new tournament with custom prize pool and rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate('/sponsor/create-tournament')}
                    className="w-full bg-yellow-400 text-black hover:bg-green-400 font-mono"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    START_CREATING
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-black border-2 border-cyan-400">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    ANALYTICS_DASHBOARD
                  </CardTitle>
                  <CardDescription className="text-green-400">
                    View detailed metrics and performance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                    onClick={() => navigate('/sponsor/analytics')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    VIEW_ANALYTICS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <LoadingModal
          isOpen={isLoadingModalOpen}
          title={loadingTitle}
          description={loadingDescription}
          transactionText={loadingTransactionText}
        />
        <ViewTournamentModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          onManage={handleManageFromView}
          tournament={selectedTournament}
        />
        <ManageTournamentModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          tournament={selectedTournament}
        />
      </div>

    </Layout>
  );
};

export default SponsorDashboard;
