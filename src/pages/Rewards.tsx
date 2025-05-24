import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoinsIcon, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Rewards = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Rewards Dashboard</h2>
              <p className="text-muted-foreground">
                Connected AA Wallet: 0x1234...5678
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <CoinsIcon className="text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 ARC</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                  <CoinsIcon className="text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 ARC</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CoinsIcon className="text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 ARC</div>
              </CardContent>
            </Card>
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
                    <TableCell>2025-05-24</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Earn</span>
                    </TableCell>
                    <TableCell className="text-green-500">+100</TableCell>
                    <TableCell>
                      <Link to="/developer" className="text-primary hover:underline">
                        Platform Payout
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-05-23</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Spend</span>
                    </TableCell>
                    <TableCell className="text-red-500">-50</TableCell>
                    <TableCell>Game Purchase</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Trophy className="h-6 w-6 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">First Game Completed</div>
                      <div className="text-sm text-muted-foreground">Complete your first game</div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Trophy className="h-6 w-6 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">10 Games Played</div>
                      <div className="text-sm text-muted-foreground">Play 10 different games</div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-muted-foreground">Joined 2025-05-20</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-sm text-muted-foreground">Joined 2025-05-22</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;