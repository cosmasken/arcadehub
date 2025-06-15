import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import TournamentHubABI from "../abi/TournamentHub.json";

import { TESTNET_CONFIG } from "../config";
import { getProvider } from "../lib/aaUtils";

// Replace with your contract address
const TOURNAMENT_HUB_ADDRESS = "0xYourTournamentHubAddress";
const POLL_INTERVAL = 10000; // 10 seconds

const Leaderboard = ({ tournamentId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        TournamentHubABI,
        provider
      );
      const filter = contract.filters.TournamentScoreSubmitted(tournamentId, null, null);
      const events = await contract.queryFilter(filter);

      const totals = {};
      events.forEach(e => {
        if ("args" in e && Array.isArray(e.args)) {
          const player = e.args[1];
          const score = e.args[2].toNumber();
          totals[player] = (totals[player] || 0) + score;
        }
      });

      const sorted = Object.entries(totals)
        .map(([player, score]) => ({ player, score: Number(score) }))
        .sort((a, b) => b.score - a.score);

      setLeaderboard(sorted);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchLeaderboard();
  };

  // Polling mechanism
  useEffect(() => {
    fetchLeaderboard(); // Initial fetch
    intervalRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [tournamentId]);

  return (
    <div>
      <h2>Leaderboard</h2>
      <button onClick={handleRefresh} disabled={loading} style={{ marginBottom: "1rem" }}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ol>
          {leaderboard.map((entry, i) => (
            <li key={entry.player}>
              #{i + 1} {entry.player.slice(0, 6)}...{entry.player.slice(-4)}: {entry.score}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;