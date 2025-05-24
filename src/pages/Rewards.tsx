import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoinsIcon, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useWalletStore } from "@/stores/useWalletStore";
import Button from "@/components/ui/button";

const Rewards = () => {
  const { walletState, aaWalletAddress } = useWalletStore();

  const isLoading = !walletState.isInitialized || !aaWalletAddress;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Rewards Dashboard</h2>
              {aaWalletAddress && (
                <p className="text-muted-foreground">
                  Connected AA Wallet: {aaWalletAddress.slice(0, 6)}...{aaWalletAddress.slice(-4)}
                </p>
              )}
            </div>
            
            <Button 
              disabled={isLoading}
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
                  Claim Rewards
                </span>
              )}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Available Balance"
              value="0 ARC"
              icon={<CoinsIcon className="text-yellow-500" />}
            />
            <StatCard
              title="Total Earned"
              value="0 ARC"
              icon={<CoinsIcon className="text-green-500" />}
            />
            <StatCard
              title="Total Spent"
              value="0 ARC"
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
                  <TableRow>
                    <TableCell>No transactions yet</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional Sections (Achievements, Referrals) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AchievementsSection achievements={[]} />
            <ReferralsSection referrals={[]} />
          </div>
        </div>
      </main>
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
    <CardContent>
      {achievements.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No achievements yet
        </div>
      ) : (
        <div className="space-y-4">
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
        </div>
      )}
    </CardContent>
  </Card>
);

const ReferralsSection = ({ referrals }: { referrals: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Referrals</CardTitle>
    </CardHeader>
    <CardContent>
      {referrals.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No referrals yet
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((ref, index) => (
            <div key={index} className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{ref.name}</div>
                <div className="text-sm text-muted-foreground">Joined {ref.joined}</div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-4">
            <Users className="mr-2 h-4 w-4" />
            Invite Friends
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Rewards;