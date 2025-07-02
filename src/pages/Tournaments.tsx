import Layout from "../components/Layout";
import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import Navigation from '../components/Navigation';
import LoadingModal from '../components/LoadingModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Trophy,
  Users,
  Zap,
  CalendarDays,
  Clock
} from 'lucide-react';
import { ethers } from 'ethers';
import useWalletStore from '../stores/useWalletStore';
import { getProvider, joinTournamentAA } from '../lib/aaUtils';
import { TESTNET_CONFIG } from '../config';
import TournamentHubABI from '../abi/TournamentHub.json';

import { Tournament } from '../types/tournament';

interface TournamentDisplay extends Tournament {
  isParticipant: boolean;
}

const Tournaments: React.FC = () => {
  const { toast } = useToast();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<TournamentDisplay | null>(null);
  const [activeTournaments, setActiveTournaments] = useState<TournamentDisplay[]>([]);
  const { aaWalletAddress, aaSigner } = useWalletStore();

  React.useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(
          TESTNET_CONFIG.smartContracts.tournamentHub,
          TournamentHubABI,
          provider);
      
    const ids: number[] = await contract.getActiveTournamentIds();
        const tournaments = await Promise.all(
          ids.map(async (id) => {
            const info = await contract.getTournamentInfo(id, aaWalletAddress || ethers.ZeroAddress);
            return {
              id: Number(info.id),
              title: info.name || `Tournament #${id}`,
              prize: ethers.formatEther(info.prizePool || '0'),
              participants: info.participants?.length || 0,
              maxParticipants: Number(info.maxParticipants || 100), // Default to 100 if not provided
              status: info.isActive ? 'live' : (info.prizesDistributed ? 'completed' : 'ended'),
              startTime: info.startTime ? new Date(Number(info.startTime) * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              isParticipant: !!info.isParticipant,
            } as TournamentDisplay;
          })
      );
        setActiveTournaments(tournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: "Error",
          description: "Failed to load tournaments. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    if (!aaWalletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to view and join tournaments.",
        variant: "destructive",
      });
      return;
    }
    fetchTournaments();
  }, [aaWalletAddress, toast]);

  const handleTournamentAction = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsConfirmationModalOpen(true);
  };

  const handleJoinConfirm = async () => {
    if (!selectedTournament || !aaSigner) return;
    
    setIsConfirmationModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      const tx = await joinTournamentAA(
        aaSigner,
        selectedTournament.id,
        0, // paymentType: sponsored gas
        { gasMultiplier: 1.5 }
      );

      await tx.wait();

      toast({
        title: "Success!",
        description: `Successfully joined ${selectedTournament.title}`,
        variant: "default",
        className: "bg-green-400 text-black border-green-400"
      });

      // Refresh tournaments
      const provider = getProvider();
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        TournamentHubABI,
        provider
      );
      const info = await contract.getTournamentInfo(selectedTournament.id, aaWalletAddress || ethers.ZeroAddress);
      
      setActiveTournaments(prev => 
        prev.map(t => 
          t.id === selectedTournament.id 
            ? { 
                ...t, 
                isParticipant: !!info.isParticipant, 
                participants: info.participants?.length || 0 
              }
            : t
        )
      );

    } catch (error: unknown) {
      console.error('Error joining tournament:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join the tournament. Please try again.';
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-500 text-white border-red-500"
      });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
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
    <Layout>
      
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400">
          TOURNAMENTS 
        </h1>
        <p className="text-green-400 text-lg tracking-wider">
          COMPETE FOR MASSIVE PRIZES
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card className="bg-black border-cyan-400 border-2 p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">33 NERO</p>
          <p className="text-sm text-green-400">TOTAL PRIZES</p>
        </Card>

        <Card className="bg-black border-cyan-400 border-2 p-4 text-center">
          <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">4,595</p>
          <p className="text-sm text-green-400">PARTICIPANTS</p>
        </Card>

        <Card className="bg-black border-cyan-400 border-2 p-4 text-center">
          <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">{activeTournaments.length}</p>
          <p className="text-sm text-green-400">ACTIVE EVENTS</p>
        </Card>

        <Card className="bg-black border-cyan-400 border-2 p-4 text-center">
          <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">{activeTournaments.filter(t => t.status === 'live').length}</p>
          <p className="text-sm text-green-400">LIVE NOW</p>
        </Card>
      </div>

      <div className="space-y-6">
        {activeTournaments.map((tournament) => (
          <Card key={tournament.id} className="bg-black border-cyan-400 border-2 p-6 hover:border-green-400 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="flex items-center space-x-4 mb-3">
                  <h3 className="text-2xl font-bold text-cyan-400">{tournament.title}</h3>
                  {getStatusBadge(tournament.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-400">PRIZE POOL:</p>
                    <p className="text-yellow-400 font-bold">{tournament.prize} ARC</p>
                  </div>
                  <div>
                    <p className="text-green-400">PARTICIPANTS:</p>
                    <p className="text-cyan-400 font-bold">{tournament.participants}/{tournament.maxParticipants}</p>
                  </div>
                  <div>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <p className="text-green-400">START TIME:</p>
                    <p className="text-cyan-400 font-bold">{tournament.startTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                {!tournament.isParticipant && tournament.status === 'live' && (
                  <Button
                    className="font-mono bg-green-400 text-black hover:bg-green-300"
                    onClick={() => handleTournamentAction(tournament)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    JOIN NOW
                  </Button>
                )}
                <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                  DETAILS
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400">PARTICIPANTS</span>
                <span className="text-cyan-400">{Math.round((tournament.participants / tournament.maxParticipants) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 border border-green-400">
                <div
                  className="bg-green-400 h-full transition-all duration-300"
                  style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 border border-green-400">
              <div
                className="bg-green-400 h-full transition-all duration-300"
                style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleJoinConfirm}
        title="Join Live Tournament"
        description={`Are you sure you want to join ${selectedTournament?.title}?`}
        confirmText="JOIN NOW"
        variant="success"
      />

      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="JOINING TOURNAMENT"
        description="Joining tournament..."
      />
    </div>

    </Layout>
  );
};

export default Tournaments;