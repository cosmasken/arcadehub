/* eslint-disable @typescript-eslint/no-explicit-any */
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoinsIcon, Users, Trophy, AlertCircle } from "lucide-react";
import { useRewardsStore } from "@/hooks/use-rewards";
import { useAAWallet } from "@/hooks/useAAWallet";
import useAuthStore from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { NERO_CHAIN_CONFIG } from "@/config";

const Rewards = () => {
  const { 
    totalEarned,
    totalSpent,
    referrals,
    achievements,
    rewardsHistory,
    addReward,
    setTotals
  } = useRewardsStore();
  
  const {
    balance,
    isLoading,
    txStatus,
    claimPayout,
    refreshBalance
  } = useAAWallet();
  const { aaWallet } = useAuthStore();

  // Refresh balance on component mount
  // useEffect(() => {
  //   refreshBalance();
  // }, [refreshBalance]);

  const handleClaim = async () => {
    const success = await claimPayout();
    if (success) {
      // Add to local history with static value of 20
      addReward({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        game: "ArcadeHub",
        type: "Earn",
        amount: 20
      });
      
      // Update totals with static value of 20
      setTotals(totalEarned + 20, totalSpent);
      
      // Refresh balance to get the actual amount claimed
      await refreshBalance();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Transaction Status Banner */}
          {txStatus.error && (
            <div className="mb-4 p-4 bg-red-100 rounded-lg flex items-center">
              <AlertCircle className="text-red-500 mr-2" />
              <span className="text-red-700">{txStatus.error}</span>
            </div>
          )}

          {txStatus.hash && (
            <div className="mb-4 p-4 bg-green-100 rounded-lg">
              <p className="text-green-700">
                Transaction confirmed!{" "}
                <a
                  href={`${NERO_CHAIN_CONFIG.explorer}/tx/${txStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on explorer
                </a>
              </p>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Rewards Dashboard</h2>
              {aaWallet && (
                <p className="text-muted-foreground">
                  Connected AA Wallet: {aaWallet.slice(0, 6)}...{aaWallet.slice(-4)}
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleClaim}
              disabled={!aaWallet || isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <CoinsIcon className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <CoinsIcon className="mr-2 h-4 w-4" />
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">•••</span>
                      Processing...
                    </span>
                  ) : (
                    <span>
                      Claim {balance || '0'} ARC
                    </span>
                  )}
                </span>
              )}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Available Balance"
              value={`${isLoading ? '...' : (balance || '0')} ARC`}
              icon={<CoinsIcon className="text-yellow-500" />}
            />
            <StatCard
              title="Total Earned"
              value={`${totalEarned} ARC`}
              icon={<CoinsIcon className="text-green-500" />}
            />
            <StatCard
              title="Total Spent"
              value={`${totalSpent} ARC`}
              icon={<CoinsIcon className="text-red-500" />}
            />
          </div>

          {/* Transactions Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardsHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <TypeBadge type={record.type} />
                      </TableCell>
                      <TableCell className={record.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                        {record.amount > 0 ? `+${record.amount}` : record.amount}
                      </TableCell>
                      <TableCell>
                        {record.game === "ArcadeHub" ? (
                          <Link to="/developer" className="text-primary hover:underline">
                            Platform Payout
                          </Link>
                        ) : (
                          record.game
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional Sections (Achievements, Referrals) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AchievementsSection achievements={achievements} />
            <ReferralsSection referrals={referrals} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon }: { title: string; value: string; icon: JSX.Element }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    type === "Earn" ? 'bg-green-100 text-green-800' :
    type === "Spend" ? 'bg-red-100 text-red-800' :
    'bg-blue-100 text-blue-800'
  }`}>
    {type}
  </span>
);

const AchievementsSection = ({ achievements }: { achievements: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Achievements</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {achievements.map((ach) => (
        <div key={ach.id} className="flex items-start gap-4">
          <Trophy className="h-6 w-6 text-yellow-500 mt-1" />
          <div className="flex-1">
            <div className="font-medium">{ach.name}</div>
            <div className="text-sm text-muted-foreground">{ach.description}</div>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(ach.progress / ach.goal) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const ReferralsSection = ({ referrals }: { referrals: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Referrals</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        {referrals.map((ref, index) => (
          <div key={index} className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{ref.name}</div>
              <div className="text-sm text-muted-foreground">Joined {ref.joined}</div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">
        <Users className="mr-2 h-4 w-4" />
        Invite Friends
      </Button>
    </CardContent>
  </Card>
);

export default Rewards;