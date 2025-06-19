/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Trophy, Coins, Users, Eye, Calendar, BarChart3, Settings, Target } from 'lucide-react';
import { ethers } from 'ethers';
import ViewTournamentModal from '../components/ViewTournamentModal';
import ManageTournamentModal from '../components/ManageTournamentModal';
import { useWalletStore } from '../stores/useWalletStore';
import {
  getUserCreatedTournaments,
  getTournamentInfo,
  forceEndTournamentAA,
  finalizeTournamentAA,
  listenForTournamentEvents,
  isTokenAllowed,
  checkAAWalletTokenAllowance
} from '../lib/aaUtils';
import { TESTNET_CONFIG } from '../config';
import { decodeError } from '../lib/utils';


const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTournaments, setActiveTournaments] = useState([]);
  const { aaWalletAddress, aaSigner } = useWalletStore();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
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

  const fetchTournaments = async () => {
    if (!aaWalletAddress) return;
    try {
      const ids = await getUserCreatedTournaments(aaWalletAddress);
      const tournaments = await Promise.all(
        ids.map(async (id) => {
          const info = await getTournamentInfo(id, aaWalletAddress);
          const decimals = tokenDecimals[info.token] || 18;
          const symbol = tokenSymbols[info.token] || 'UNKNOWN';
         let prizePool;
            if (typeof info.prizePool === 'string') {
              console.warn(`PrizePool is string: ${info.prizePool}`);
              const [integerPart] = info.prizePool.split('.');
              prizePool = ethers.parseUnits(integerPart, decimals);
            } else {
              prizePool = ethers.toBigInt(info.prizePool);
            }
          return {
            id: info.id,
            title: info.name,
             prizePool: Number(ethers.formatUnits(prizePool, decimals)).toFixed(2),
            // prizePool: Number(ethers.formatUnits(info.prizePool, decimals)).toFixed(2),
            token: info.token,
            tokenSymbol: symbol,
            participants: info.participants.length,
            status: info.isActive ? 'live' : info.prizesDistributed ? 'completed' : 'ended',
            startTime: new Date(info.startTime).toISOString().slice(0, 10),
            yourContribution: Number(ethers.formatUnits(info.prizePool, decimals)).toFixed(2), // Assume creator contributed all
            // distributionTime: info.distributionTime
          };
        })
      );
      setActiveTournaments(tournaments);
      setSponsorStats(prev => ({
        ...prev,
        activeTournaments: tournaments.filter(t => t.status === 'live').length,
        completedTournaments: tournaments.filter(t => t.status === 'completed').length,
        totalPlayers: tournaments.reduce((sum, t) => sum + t.participants, 0),
        totalSponsored: tournaments.reduce((sum, t) => sum + parseFloat(t.prizePool), 0).toFixed(2)
      }));
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: decodeError(error),
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTournaments();
    const handleEvent = (event) => {
      if (event.event === 'TournamentCreated' && event.data.creator.toLowerCase() === aaWalletAddress.toLowerCase()) {
        fetchTournaments();
      } else if (event.event === 'PrizesDistributed') {
        setActiveTournaments(prev =>
          prev.map(t =>
            t.id === event.data.tournamentId ? { ...t, status: 'completed' } : t
          )
        );
      } else if (event.event === 'TournamentJoined') {
        setActiveTournaments(prev =>
          prev.map(t =>
            t.id === event.data.tournamentId
              ? { ...t, participants: t.participants + 1 }
              : t
          )
        );
      } else if (event.event === 'TournamentEnded') {
        setActiveTournaments(prev =>
          prev.map(t =>
            t.id === event.data.tournamentId
              ? { ...t, status: 'ended', distributionTime: Math.floor(Date.now() / 1000) + 120 }
              : t
          )
        );
      }
    };
    // listenForTournamentEvents(handleEvent);
    return () => {
      // Cleanup event listeners (implement in listenForTournamentEvents)
    };
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
    }
  };

  const handleFinalizeTournament = async (tournament) => {
    try {
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
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-mono font-bold text-cyan-400 neon-text">
                &gt; SPONSOR_DASHBOARD &lt;
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
              &gt; ACTIVE TOURNAMENTS &lt;
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
                          END NOW
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                          disabled={tournament.status !== 'ended' || Math.floor(Date.now() / 1000) < tournament.distributionTime}
                          onClick={() => handleFinalizeTournament(tournament)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          FINALIZE
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
  );
};

export default SponsorDashboard;
