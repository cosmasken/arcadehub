import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Provider } from '../contexts/Web3Context';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import SponsorSelectionModal from '../components/SponsorSelectionModal';
import TokenPaymentModal from '../components/TokenPaymentModal';
import LoadingModal from '../components/LoadingModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Trophy, 
  Clock, 
  Users, 
  Zap,
  Calendar,
  Target,
  Gamepad2,
  ArrowLeft,
  DollarSign,
  Star,
  Gift
} from 'lucide-react';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'join' | 'register'>('register');

  // Extended tournament data with different types
  const tournaments = [
    {
      id: 1,
      title: "CRYPTO CHAMPIONSHIP",
      game: "Crypto Battles",
      prize: "10 NERO",
      participants: 1247,
      maxParticipants: 2000,
      startTime: "2024-06-15 18:00",
      status: "live",
      duration: "72 HOURS",
      entryFee: "0.1 NERO",
      type: "standard",
      description: "The ultimate crypto gaming championship with massive prizes and intense competition.",
      rules: ["No cheating or exploits allowed", "Players must be 18+ years old", "Entry fees are non-refundable"],
      sponsors: []
    },
    {
      id: 2,
      title: "NFT GRAND PRIX",
      game: "NFT Racing",
      prize: "5 NERO",
      participants: 892,
      maxParticipants: 1500,
      startTime: "2024-06-20 12:00",
      status: "upcoming",
      duration: "48 HOURS",
      entryFee: "FREE",
      type: "sponsored",
      description: "Race for glory in this sponsored NFT racing tournament with exclusive rewards.",
      rules: ["Must complete sponsor requirements", "Fair play policy enforced", "Rewards distributed within 24 hours"],
      sponsors: [
        { name: "CryptoRace", logo: "🏎️", reward: "Exclusive NFT Car" },
        { name: "BlockChain Motors", logo: "🚗", reward: "1000 RACE tokens" },
        { name: "MetaVerse Racing", logo: "🏁", reward: "VIP Access Pass" }
      ]
    },
    {
      id: 3,
      title: "DEFI QUEST MASTERS",
      game: "DeFi Quest",
      prize: "15 NERO",
      participants: 2000,
      maxParticipants: 2000,
      startTime: "2024-06-10 10:00",
      status: "completed",
      duration: "96 HOURS",
      entryFee: "0.2 NERO",
      type: "standard",
      description: "Master the DeFi protocols in this challenging quest tournament.",
      rules: ["Advanced DeFi knowledge recommended", "Real protocol interactions", "Safety guidelines must be followed"],
      sponsors: []
    },
    {
      id: 4,
      title: "PIXEL WARRIORS CUP",
      game: "Pixel Warriors",
      prize: "3 NERO",
      participants: 456,
      maxParticipants: 1000,
      startTime: "2024-06-25 16:00",
      status: "upcoming",
      duration: "24 HOURS",
      entryFee: "PAY WITH TOKENS",
      type: "prepaid",
      description: "Battle in the pixel realm using your favorite tokens as entry payment.",
      rules: ["Token payments only", "Multiple payment options available", "Instant tournament access"],
      sponsors: []
    }
  ];

  const tournament = tournaments.find(t => t.id === parseInt(id || '0'));

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">TOURNAMENT NOT FOUND</h1>
          <Button onClick={() => navigate('/tournaments')} className="bg-cyan-400 text-black hover:bg-cyan-300">
            BACK TO TOURNAMENTS
          </Button>
        </div>
      </div>
    );
  }

  const handleTournamentAction = (action: 'join' | 'register') => {
    setActionType(action);
    
    if (tournament.type === 'sponsored') {
      setIsSponsorModalOpen(true);
    } else if (tournament.type === 'prepaid') {
      setIsTokenModalOpen(true);
    } else {
      setIsConfirmationModalOpen(true);
    }
  };

  const handleSponsorJoin = async (selectedSponsor: any) => {
    setIsSponsorModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoadingModalOpen(false);
      
      toast({
        title: "Successfully Joined Sponsored Tournament!",
        description: `You've joined ${tournament.title} sponsored by ${selectedSponsor.name}`,
        className: "bg-green-400 text-black border-green-400",
      });
    } catch (error) {
      setIsLoadingModalOpen(false);
      toast({
        title: "Join Failed",
        description: "Failed to join the sponsored tournament. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTokenPayment = async (selectedToken: any) => {
    setIsTokenModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsLoadingModalOpen(false);
      
      toast({
        title: "Payment Successful!",
        description: `You've paid with ${selectedToken.name} and joined ${tournament.title}`,
        className: "bg-green-400 text-black border-green-400",
      });
    } catch (error) {
      setIsLoadingModalOpen(false);
      toast({
        title: "Payment Failed",
        description: "Failed to process token payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStandardJoin = async () => {
    setIsConfirmationModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoadingModalOpen(false);
      
      toast({
        title: "Successfully Joined Tournament!",
        description: `You have joined ${tournament.title}. Good luck!`,
        className: "bg-green-400 text-black border-green-400",
      });
    } catch (error) {
      setIsLoadingModalOpen(false);
      toast({
        title: "Join Failed",
        description: "Failed to join the tournament. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-400 text-black animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-400 text-black">UPCOMING</Badge>;
      case 'completed':
        return <Badge className="bg-gray-400 text-black">COMPLETED</Badge>;
      default:
        return <Badge className="bg-cyan-400 text-black">{status.toUpperCase()}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sponsored':
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'prepaid':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      default:
        return <Trophy className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-4xl">
            {/* Back Button */}
            <Button 
              onClick={() => navigate('/tournaments')}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO TOURNAMENTS
            </Button>

            {/* Tournament Header */}
            <Card className="bg-black border-2 border-cyan-400 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(tournament.type)}
                    <h1 className="text-3xl font-bold text-cyan-400">{tournament.title}</h1>
                    {getStatusBadge(tournament.status)}
                  </div>
                  <p className="text-green-400 text-lg">{tournament.game}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 text-2xl font-bold">{tournament.prize}</p>
                  <p className="text-green-400">PRIZE POOL</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-green-400 text-sm">PARTICIPANTS:</p>
                  <p className="text-cyan-400 font-bold">{tournament.participants}/{tournament.maxParticipants}</p>
                </div>
                <div>
                  <p className="text-green-400 text-sm">ENTRY FEE:</p>
                  <p className="text-cyan-400 font-bold">{tournament.entryFee}</p>
                </div>
                <div>
                  <p className="text-green-400 text-sm">DURATION:</p>
                  <p className="text-cyan-400 font-bold">{tournament.duration}</p>
                </div>
                <div>
                  <p className="text-green-400 text-sm">TYPE:</p>
                  <p className="text-cyan-400 font-bold">{tournament.type.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">{tournament.startTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">{tournament.duration}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
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

              {/* Action Button */}
              <div className="flex justify-center">
                <Button 
                  className={`font-mono ${
                    tournament.status === 'live' 
                      ? 'bg-green-400 text-black hover:bg-green-300' 
                      : tournament.status === 'upcoming'
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-gray-400 text-black cursor-not-allowed'
                  }`}
                  disabled={tournament.status === 'completed'}
                  onClick={() => handleTournamentAction(tournament.status === 'live' ? 'join' : 'register')}
                >
                  {tournament.status === 'live' ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      JOIN NOW
                    </>
                  ) : tournament.status === 'upcoming' ? (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      {tournament.type === 'sponsored' ? 'JOIN WITH SPONSOR' : tournament.type === 'prepaid' ? 'PAY TO JOIN' : 'REGISTER'}
                    </>
                  ) : (
                    'COMPLETED'
                  )}
                </Button>
              </div>
            </Card>

            {/* Tournament Description */}
            <Card className="bg-black border-2 border-green-400 p-6 mb-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-3">DESCRIPTION</h2>
              <p className="text-green-400">{tournament.description}</p>
            </Card>

            {/* Tournament Rules */}
            <Card className="bg-black border-2 border-green-400 p-6 mb-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-3">RULES & REGULATIONS</h2>
              <ul className="space-y-2">
                {tournament.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span className="text-green-400">{rule}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Sponsors (if sponsored tournament) */}
            {tournament.type === 'sponsored' && tournament.sponsors.length > 0 && (
              <Card className="bg-black border-2 border-yellow-400 p-6">
                <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  TOURNAMENT SPONSORS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tournament.sponsors.map((sponsor, index) => (
                    <div key={index} className="border border-yellow-400 p-4 rounded text-center">
                      <div className="text-2xl mb-2">{sponsor.logo}</div>
                      <h3 className="text-yellow-400 font-bold">{sponsor.name}</h3>
                      <p className="text-green-400 text-sm">{sponsor.reward}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <SponsorSelectionModal
          isOpen={isSponsorModalOpen}
          onClose={() => setIsSponsorModalOpen(false)}
          onSelectSponsor={handleSponsorJoin}
          sponsors={tournament.sponsors}
          tournament={tournament}
        />

        <TokenPaymentModal
          isOpen={isTokenModalOpen}
          onClose={() => setIsTokenModalOpen(false)}
          onPayment={handleTokenPayment}
          tournament={tournament}
        />

        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleStandardJoin}
          title={actionType === 'join' ? 'Join Live Tournament' : 'Register for Tournament'}
          description={`Are you sure you want to ${actionType} ${tournament.title}? ${tournament.entryFee !== 'FREE' ? `The entry fee of ${tournament.entryFee} will be charged.` : ''}`}
          confirmText={actionType === 'join' ? 'JOIN NOW' : 'REGISTER'}
          variant="success"
        />

        <LoadingModal
          isOpen={isLoadingModalOpen}
          title={actionType === 'join' ? 'JOINING TOURNAMENT' : 'PROCESSING'}
          description={actionType === 'join' ? 'Joining tournament...' : 'Processing your request...'}
        />
      </div>
    </Web3Provider>
  );
};

export default TournamentDetail;
