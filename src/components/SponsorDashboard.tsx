import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Trophy, 
  Coins, 
  Users, 
  Eye,
  Calendar,
  Target,
  BarChart3,
  Settings
} from 'lucide-react';
import ViewTournamentModal from './ViewTournamentModal';
import ManageTournamentModal from './ManageTournamentModal';

const SponsorDashboard = () => {
  const navigate = useNavigate();

  // Add modal state
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Mock sponsor data
  const sponsorStats = {
    totalSponsored: "25.5 ETH",
    activeTournaments: 3,
    totalPlayers: 1247,
    completedTournaments: 12
  };

  const activeTournaments = [
    {
      id: 1,
      title: "CRYPTO CHAMPIONSHIP",
      game: "Crypto Battles",
      prizePool: "10 ETH",
      participants: 1247,
      status: "live",
      startDate: "2024-06-15",
      yourContribution: "10 ETH"
    },
    {
      id: 2,
      title: "NFT GRAND PRIX",
      game: "NFT Racing", 
      prizePool: "5 ETH",
      participants: 892,
      status: "upcoming",
      startDate: "2024-06-20",
      yourContribution: "5 ETH"
    }
  ];

  // Redirect if not logged in
  // React.useEffect(() => {
  //   if (!user) {
  //     navigate('/sponsor/login');
  //   }
  // }, [user, navigate]);

  // if (!user) {
  //   return null;
  // }

  const handleViewTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setIsViewModalOpen(true);
  };

  const handleManageTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    setIsManageModalOpen(true);
  };

  const handleManageFromView = () => {
    setIsViewModalOpen(false);
    setIsManageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-mono font-bold text-cyan-400 neon-text">
                &gt; SPONSOR_DASHBOARD &lt;
              </h1>
              <p className="text-green-400 mt-2">
                Welcome back, {user.name || 'SPONSOR_001'}
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

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black border-2 border-yellow-400 text-center">
              <CardContent className="p-4">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400 font-mono">
                  {sponsorStats.totalSponsored}
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

          {/* Active Tournaments */}
          <div className="mb-8">
            <h2 className="text-xl font-mono text-cyan-400 mb-4">
              &gt; ACTIVE_TOURNAMENTS &lt;
            </h2>
            <div className="space-y-4">
              {activeTournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-black border-2 border-green-400">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-cyan-400 font-mono font-bold text-lg">
                            {tournament.title}
                          </h3>
                          <Badge className={`font-mono ${
                            tournament.status === 'live' 
                              ? 'bg-green-400 text-black animate-pulse' 
                              : 'bg-yellow-400 text-black'
                          }`}>
                            {tournament.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-green-400 mb-2">{tournament.game}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">Prize: {tournament.prizePool}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">{tournament.participants} players</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400">{tournament.startDate}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-yellow-400 text-sm font-mono">
                            Your contribution: {tournament.yourContribution}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
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

          {/* Quick Actions */}
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
                >
                  <Eye className="w-4 h-4 mr-2" />
                  VIEW_ANALYTICS
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
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
// This