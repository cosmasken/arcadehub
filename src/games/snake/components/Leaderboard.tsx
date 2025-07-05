import React, { useEffect, useState } from 'react';
import { getTournamentLeaderboard } from '../../../lib/tournamentUtils';

interface LeaderboardEntry {
  user: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  tournamentId: number | null;
  onClose?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ tournamentId, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;
    setLoading(true);
    getTournamentLeaderboard(tournamentId)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load leaderboard');
        setLoading(false);
      });
  }, [tournamentId]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-cyan-400/30 w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Leaderboard</h2>
        {loading ? (
          <div className="text-center text-gray-300 py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">{error}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-cyan-300 border-b border-cyan-700">
                <th className="py-2 px-2">Rank</th>
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-6">No scores yet.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.rank} className="border-b border-gray-800 hover:bg-cyan-900/10">
                    <td className="py-1 px-2 font-bold text-cyan-300">{entry.rank}</td>
                    <td className="py-1 px-2">{entry.user}</td>
                    <td className="py-1 px-2 text-right text-yellow-300">{entry.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
