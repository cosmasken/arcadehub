import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoinsIcon, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useWalletStore } from "@/stores/useWalletStore";
import { Button } from "@/components/ui/button";

// Dummy data for demonstration
const balance = 1200;
const totalEarned = 3400;
const totalSpent = 2200;
const achievements = [
  { id: 1, name: "First Win", description: "Win your first game", progress: 1, goal: 1 },
  { id: 2, name: "Collector", description: "Collect 10 NFTs", progress: 7, goal: 10 },
];
const referrals = [
  { name: "Alice", joined: "2 days ago" },
  { name: "Bob", joined: "1 week ago" },
];
const transactions = [
  { id: 1, type: "Earn", amount: 100, date: "2025-05-20", description: "Game Reward" },
  { id: 2, type: "Spend", amount: 50, date: "2025-05-19", description: "NFT Purchase" },
];

const Rewards = () => {
  const { walletState, aaWalletAddress } = useWalletStore();

  const isLoading = !walletState.isInitialized || !aaWalletAddress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Navbar component should be imported and used here */}
      {/* <Navbar /> */}
      <main className="flex-grow pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Available Balance</CardTitle>
                  <CoinsIcon className="text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{isLoading ? '...' : (balance || '0')} ARC</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Total Earned</CardTitle>
                  <CoinsIcon className="text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalEarned} ARC</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Total Spent</CardTitle>
                  <CoinsIcon className="text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalSpent} ARC</div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="mb-8 bg-black/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <TypeBadge type={tx.type} />
                      </TableCell>
                      <TableCell className="text-white">{tx.amount} ARC</TableCell>
                      <TableCell className="text-white">{tx.date}</TableCell>
                      <TableCell className="text-white">{tx.description}</TableCell>
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
      {/* Footer component should be imported and used here */}
      {/* <Footer /> */}
    </div>
  );
};

// Helper Components
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
  <Card className="bg-black/50 border-purple-500/30">
    <CardHeader>
      <CardTitle className="text-white">Achievements</CardTitle>
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
                <div className="font-medium text-white">{ach.name}</div>
                <div className="text-sm text-purple-200">{ach.description}</div>
                <div className="mt-2 w-full bg-purple-900/40 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
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
  <Card className="bg-black/50 border-purple-500/30">
    <CardHeader>
      <CardTitle className="text-white">Referrals</CardTitle>
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
              <Users className="h-5 w-5 text-purple-300" />
              <div>
                <div className="font-medium text-white">{ref.name}</div>
                <div className="text-sm text-purple-200">Joined {ref.joined}</div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-4 border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
            <Users className="mr-2 h-4 w-4" />
            Invite Friends
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Rewards;