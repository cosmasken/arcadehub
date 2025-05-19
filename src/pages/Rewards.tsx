
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoinsIcon, Users, Trophy } from "lucide-react";

const Rewards = () => {
  // Mock data for rewards history
  const rewardsHistory = [
    { id: 1, date: "2025-05-18", game: "Star Blaster", type: "Earn", amount: 50 },
    { id: 2, date: "2025-05-17", game: "Puzzle Pop", type: "Earn", amount: 30 },
    { id: 3, date: "2025-05-16", game: "Clicker Craze", type: "Earn", amount: 40 },
    { id: 4, date: "2025-05-15", game: "-", type: "Referral", amount: 25 },
    { id: 5, date: "2025-05-14", game: "Star Blaster", type: "Spend", amount: -20 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Rewards & Earnings</h2>
            <Button className="bg-accent text-accent-foreground">
              <CoinsIcon size={18} className="mr-2" /> Claim Rewards
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Earned</CardTitle>
                <CardDescription>All time earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CoinsIcon size={24} className="mr-2 text-yellow-500" />
                  <span className="text-3xl font-bold">500 ARC</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>All time spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CoinsIcon size={24} className="mr-2 text-red-500" />
                  <span className="text-3xl font-bold">100 ARC</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Referrals</CardTitle>
                <CardDescription>Friends invited</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users size={24} className="mr-2 text-blue-500" />
                  <span className="text-3xl font-bold">5</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                Track your rewards from games and referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (ARC)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardsHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.game}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          record.type === "Earn" ? "bg-green-500/20 text-green-500" : 
                          record.type === "Referral" ? "bg-blue-500/20 text-blue-500" : 
                          "bg-red-500/20 text-red-500"
                        }`}>
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell className={record.amount > 0 ? "text-green-500" : "text-red-500"}>
                        {record.amount > 0 ? `+${record.amount}` : record.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Referrals</CardTitle>
                <CardDescription>Invite friends to earn ARC</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2">Invite friends and earn 25 ARC for each friend who joins!</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                      Alex - Joined May 15, 2025
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                      Maya - Joined May 12, 2025
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                      Leo - Joined May 10, 2025
                    </li>
                  </ul>
                  <Button className="w-full bg-primary">
                    <Users size={18} className="mr-2" /> Invite More Friends
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Trophy size={24} className="mr-3 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">Game Master</h4>
                      <p className="text-sm text-muted-foreground">Play 50 games</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <p className="text-xs mt-1">35/50 games</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Trophy size={24} className="mr-3 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">Big Earner</h4>
                      <p className="text-sm text-muted-foreground">Earn 1000 ARC</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                      <p className="text-xs mt-1">500/1000 ARC</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;
