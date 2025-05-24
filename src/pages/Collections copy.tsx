import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const nfts = [
  {
    id: "nft1",
    name: "Star Trophy",
    image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800",
    rarity: "Legendary",
    description: "Awarded for top leaderboard performance.",
  },
  {
    id: "nft2",
    name: "Race Car",
    image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800",
    rarity: "Rare",
    description: "Earned by winning 10 races.",
  },
  {
    id: "nft3",
    name: "Puzzle Master",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    rarity: "Epic",
    description: "Solve 50 puzzles to unlock.",
  },
];

const rarityColors: Record<string, string> = {
  Legendary: "bg-yellow-500 text-yellow-900",
  Epic: "bg-purple-500 text-purple-100",
  Rare: "bg-blue-500 text-blue-100",
  Common: "bg-gray-500 text-gray-100",
};

const Collections = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center py-12">
    <Card className="w-full max-w-4xl bg-black/50 border-purple-500/30 mb-8">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Your NFT Collections</CardTitle>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center text-purple-200 py-8">No NFTs in your collection yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${rarityColors[nft.rarity] || rarityColors["Common"]}`}
                    >
                      {nft.rarity}
                    </span>
                  </div>
                  <div className="text-purple-200 text-sm flex-1">{nft.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

export default Collections;