import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Code, Star, Loader2, Eye, Link as LinkIcon, Copy } from "lucide-react";
import { Button } from "../components/ui/button";
import supabase from "../hooks/use-supabase";
import { useWalletStore } from "../stores/useWalletStore";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full p-0 relative overflow-hidden">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

const developerStats = {
  totalGames: 0,
  totalPlays: 1200,
  totalRevenue: 340.5,
  avgRating: 4.7,
};

type Game = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  ipfs_hash?: string;
  developer?: string;
};

type GameStats = {
  game_id: string;
  total_plays: number;
  avg_rating: number | null;
  total_ratings: number;
};

const STATIC_IMAGE =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80";

const Developers = () => {
  const { aaWalletAddress } = useWalletStore();
  const [games, setGames] = useState<Game[]>([]);
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const fetchGamesAndStats = async () => {
      setLoading(true);
      if (!aaWalletAddress) {
        setGames([]);
        setGameStats({});
        setLoading(false);
        return;
      }
      // 1. Fetch games
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("game_id, title, description, category, ipfs_hash, developer")
        .eq("developer", aaWalletAddress);

      if (gamesError || !gamesData) {
        setGames([]);
        setGameStats({});
        setLoading(false);
        return;
      }
      const gamesList = gamesData.map((g: any) => ({
        id: g.game_id,
        title: g.title,
        description: g.description,
        category: g.category,
        ipfs_hash: g.ipfs_hash,
        developer: g.developer,
      }));
      setGames(gamesList);

      // 2. Fetch stats for these games
      const { data: statsData } = await supabase
        .from("game_stats")
        .select("*")
        .in("game_id", gamesList.map(g => g.id));

      // 3. Create a lookup for stats by game_id
      const statsLookup: Record<string, GameStats> = {};
      if (statsData) {
        for (const stat of statsData) {
          statsLookup[stat.game_id] = stat;
        }
      }
      setGameStats(statsLookup);
      setLoading(false);
    };
    fetchGamesAndStats();
  }, [aaWalletAddress]);

  // Update totalGames in developerStats
  const stats = { ...developerStats, totalGames: games.length };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
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
                <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
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
                <div className="text-2xl font-bold text-white">
                  {games.reduce((sum, g) => sum + (gameStats[g.id]?.total_plays || 0), 0)}
                </div>
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
                <div className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</div>
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
                <div className="text-2xl font-bold text-yellow-400">
                  {games.length
                    ? (
                        games.reduce(
                          (sum, g) => sum + (gameStats[g.id]?.avg_rating || 0),
                          0
                        ) / games.length
                      ).toFixed(2)
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games List */}
          <Card className="mb-8 bg-black/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Your Games</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin w-10 h-10 text-purple-400" />
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No games uploaded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {games.map((game) => {
                    const stats = gameStats[game.id] || {};
                    return (
                      <div
                        key={game.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-purple-500/10 rounded-lg"
                      >
                        <div>
                          <div className="font-bold text-white text-lg">{game.title}</div>
                          <div className="text-sm text-purple-200">
                            Plays: {stats.total_plays || 0} | Revenue: <span className="text-green-400">$0.00</span> | Rating:{" "}
                            <span className="text-yellow-400">
                              {stats.avg_rating ? stats.avg_rating.toFixed(2) : "N/A"}
                            </span>
                          </div>
                          <div className="text-xs mt-1">
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                              Pending
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 flex items-center gap-1"
                            onClick={() => {
                              setSelectedGame(game);
                              setModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" /> View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Modal for game details */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedGame && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Static image */}
            <div className="flex-shrink-0">
              <img
                src={STATIC_IMAGE}
                alt="Game"
                className="w-40 h-40 object-cover rounded-lg shadow-lg border-2 border-purple-700"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-white">{selectedGame.title}</h2>
              <div className="mb-2 text-sm text-purple-200">
                <span className="font-semibold">Game ID:</span> {selectedGame.id}
              </div>
              <div className="mb-2 text-sm text-purple-200">
                <span className="font-semibold">Category:</span> {selectedGame.category || "N/A"}
              </div>
              <div className="mb-2 text-sm text-purple-200">
                <span className="font-semibold">Description:</span> {selectedGame.description || "No description"}
              </div>
              <div className="mb-2 text-sm text-purple-200 flex items-center gap-2">
                <span className="font-semibold">IPFS Link:</span>
                {selectedGame.ipfs_hash ? (
                  <>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${selectedGame.ipfs_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View
                    </a>
                    <button
                      className="ml-1 text-gray-400 hover:text-white"
                      title="Copy IPFS link"
                      onClick={() =>
                        copyToClipboard(
                          `https://gateway.pinata.cloud/ipfs/${selectedGame.ipfs_hash}`
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
              <div className="mb-2 text-sm text-purple-200">
                <span className="font-semibold">Status:</span>{" "}
                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                  Pending
                </span>
              </div>
              <div className="mb-2 text-sm text-purple-200">
                <span className="font-semibold">Developer:</span> {selectedGame.developer}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Developers;