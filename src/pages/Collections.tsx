import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useWalletStore } from "../stores/useWalletStore";
import { getNFTs } from "../utils/aaUtils";

const rarityColors: Record<string, string> = {
  Legendary: "bg-yellow-500 text-yellow-900",
  Epic: "bg-purple-500 text-purple-100",
  Rare: "bg-blue-500 text-blue-100",
  Common: "bg-gray-500 text-gray-100",
};

// Mock data for when not connected or as fallback
const mockNFTs = [
  {
    id: "nft1",
    tokenId: 1,
    name: "Star Trophy",
    image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800",
    rarity: "Legendary",
    description: "Awarded for top leaderboard performance.",
  },
  {
    id: "nft2",
    tokenId: 2,
    name: "Race Car",
    image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800",
    rarity: "Rare",
    description: "Earned by winning 10 races.",
  },
  {
    id: "nft3",
    tokenId: 3,
    name: "Puzzle Master",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    rarity: "Epic",
    description: "Solve 50 puzzles to unlock.",
  },
];

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
    <p className="text-purple-200">Loading your NFTs...</p>
  </div>
);

const Collections: React.FC = () => {
  const { isConnected,aaWalletAddress } = useWalletStore();
  const [nfts, setNfts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadNFTs = useCallback(async () => {
    if (!isConnected || !aaWalletAddress) {
      setNfts([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const fetchedNFTs = await getNFTs(aaWalletAddress);
      setNfts(fetchedNFTs);
    } catch (err) {
      console.log("Error fetching NFTs:", err);
      setError("Failed to load NFTs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, aaWalletAddress]);

  useEffect(() => {
    if (isConnected) {
      loadNFTs();
    } else {
      setNfts([]);
    }
  }, [isConnected, loadNFTs]);

  // Show mock data if not connected
  const displayNFTs = isConnected ? nfts : mockNFTs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center py-12">
      <Card className="w-full max-w-4xl bg-black/50 border-purple-500/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Your NFT Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gallery-header mb-4">
            {isConnected && nfts.length > 0 && (
              <button
                onClick={loadNFTs}
                className="px-3 py-1 rounded bg-purple-700 text-white hover:bg-purple-800 transition"
                title="Refresh your NFT collection"
              >
                Refresh
              </button>
            )}
          </div>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={loadNFTs}
                className="px-3 py-1 rounded bg-purple-700 text-white hover:bg-purple-800 transition"
              >
                Try Again
              </button>
            </div>
          ) : displayNFTs.length === 0 ? (
            <div className="text-center text-purple-200 py-8">
              You don't have any NFTs yet. Mint your first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {displayNFTs.map((nft) => (
                <div
                  key={nft.id || nft.tokenId}
                  className="bg-purple-900/40 border border-purple-700/40 rounded-xl overflow-hidden flex flex-col"
                >
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="object-cover w-full h-48"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-lg">{nft.name}</span>
                      {nft.rarity && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${rarityColors[nft.rarity] || rarityColors["Common"]}`}
                        >
                          {nft.rarity}
                        </span>
                      )}
                    </div>
                    <p className="nft-id text-purple-300 text-xs mb-1">ID: {nft.tokenId}</p>
                    {nft.description && (
                      <div className="text-purple-200 text-sm flex-1">{nft.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Collections;