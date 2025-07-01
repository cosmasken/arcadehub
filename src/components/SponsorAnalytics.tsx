import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Trophy, 
  Coins,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SponsorAnalytics = () => {
  const navigate = useNavigate();

  // Mock analytics data
  const analyticsData = {
    totalInvestment: "25.5 NERO",
    totalParticipants: 3421,
    completedTournaments: 12,
    avgEngagement: "87%",
    roi: "+156%"
  };

  const participationData = [
    { month: 'Jan', participants: 450 },
    { month: 'Feb', participants: 680 },
    { month: 'Mar', participants: 890 },
    { month: 'Apr', participants: 1200 },
    { month: 'May', participants: 1450 },
    { month: 'Jun', participants: 1650 }
  ];

  const investmentData = [
    { tournament: 'Crypto Championship', investment: 10, participants: 1247 },
    { tournament: 'NFT Grand Prix', investment: 5, participants: 892 },
    { tournament: 'DeFi Quest', investment: 3, participants: 567 },
    { tournament: 'Pixel Warriors', investment: 2, participants: 234 }
  ];

  const gameTypeData = [
    { name: 'Battle Games', value: 40, color: '#00ff00' },
    { name: 'Racing Games', value: 30, color: '#00ffff' },
    { name: 'Strategy Games', value: 20, color: '#ffff00' },
    { name: 'Puzzle Games', value: 10, color: '#ff00ff' }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400">
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button 
                onClick={() => navigate('/sponsor/dashboard')}
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO DASHBOARD
              </Button>
              <h1 className="text-3xl font-mono font-bold text-cyan-400">
                 SPONSOR_ANALYTICS 
              </h1>
              <p className="text-green-400 mt-2">
                Detailed insights into your tournament sponsorships
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-black border-2 border-yellow-400 text-center">
              <CardContent className="p-4">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400 font-mono">
                  {analyticsData.totalInvestment}
                </div>
                <div className="text-green-400 text-sm">TOTAL_INVESTED</div>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-cyan-400 text-center">
              <CardContent className="p-4">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {analyticsData.totalParticipants}
                </div>
                <div className="text-green-400 text-sm">TOTAL_PLAYERS</div>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-green-400 text-center">
              <CardContent className="p-4">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400 font-mono">
                  {analyticsData.completedTournaments}
                </div>
                <div className="text-green-400 text-sm">COMPLETED</div>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-purple-400 text-center">
              <CardContent className="p-4">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400 font-mono">
                  {analyticsData.avgEngagement}
                </div>
                <div className="text-green-400 text-sm">AVG_ENGAGEMENT</div>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-pink-400 text-center">
              <CardContent className="p-4">
                <TrendingUp className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-pink-400 font-mono">
                  {analyticsData.roi}
                </div>
                <div className="text-green-400 text-sm">ROI</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Participation Growth */}
            <Card className="bg-black border-2 border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono">PARTICIPATION_GROWTH</CardTitle>
                <CardDescription className="text-green-400/80">
                  Monthly participant engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={participationData}>
                      <XAxis dataKey="month" stroke="#00ff00" />
                      <YAxis stroke="#00ff00" />
                      <Line 
                        type="monotone" 
                        dataKey="participants" 
                        stroke="#00ff00" 
                        strokeWidth={2}
                        dot={{ fill: "#00ff00" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Investment vs Participation */}
            <Card className="bg-black border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">INVESTMENT_ANALYSIS</CardTitle>
                <CardDescription className="text-green-400/80">
                  Investment vs participant count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={investmentData}>
                      <XAxis dataKey="tournament" stroke="#ffff00" />
                      <YAxis stroke="#ffff00" />
                      <Bar dataKey="investment" fill="#ffff00" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Type Distribution */}
          <Card className="bg-black border-2 border-cyan-400 mb-8">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">GAME_TYPE_DISTRIBUTION</CardTitle>
              <CardDescription className="text-green-400/80">
                Your sponsorship portfolio by game categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gameTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {gameTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {gameTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-green-400">{item.name}</span>
                      </div>
                      <span className="text-cyan-400 font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SponsorAnalytics;
