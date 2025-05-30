import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Code, Star } from "lucide-react";
import { Button } from "../components/ui/button";

// Dummy data for demonstration
const developerStats = {
  totalGames: 5,
  totalPlays: 1200,
  totalRevenue: 340.5,
  avgRating: 4.7,
};
const games = [
  { id: 1, title: "Space Adventure", plays: 500, revenue: 120, rating: 4.8, status: "Published" },
  { id: 2, title: "Puzzle Pop", plays: 300, revenue: 80, rating: 4.6, status: "Draft" },
  { id: 3, title: "Turbo Dash", plays: 400, revenue: 140.5, rating: 4.7, status: "Published" },
];

const Developers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Navbar component should be imported and used here */}
      {/* <Navbar /> */}
      <main className="flex-grow pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Developer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Total Games</CardTitle>
                  <Code className="text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{developerStats.totalGames}</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Total Plays</CardTitle>
                  <Users className="text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{developerStats.totalPlays.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Revenue</CardTitle>
                  <span className="text-green-400 font-bold text-xl">$</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">${developerStats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Avg Rating</CardTitle>
                  <Star className="text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{developerStats.avgRating}</div>
              </CardContent>
            </Card>
          </div>

          {/* Games List */}
          <Card className="mb-8 bg-black/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Your Games</CardTitle>
            </CardHeader>
            <CardContent>
              {games.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No games uploaded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {games.map((game) => (
                    <div key={game.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-purple-500/10 rounded-lg">
                      <div>
                        <div className="font-bold text-white text-lg">{game.title}</div>
                        <div className="text-sm text-purple-200">Plays: {game.plays.toLocaleString()} | Revenue: <span className="text-green-400">${game.revenue.toFixed(2)}</span> | Rating: <span className="text-yellow-400">{game.rating}</span></div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded-full ${
                            game.status === "Published"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}>
                            {game.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 flex gap-2">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">Edit</Button>
                        <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Developers;