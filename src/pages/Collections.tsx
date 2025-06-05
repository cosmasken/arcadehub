import React, { useState, useEffect, useCallback } from "react";
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWalletStore } from "../stores/useWalletStore";
import { getNFTs } from "../lib/aaUtils";

const rarityColors: Record<string, string> = {
  Legendary: "bg-yellow-500 text-yellow-900",
  Epic: "bg-purple-500 text-purple-100",
  Rare: "bg-blue-500 text-blue-100",
  Common: "bg-gray-500 text-gray-100",
};

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
    <p className="text-cyan-200">Loading your NFTs...</p>
  </div>
);

const Collections: React.FC = () => {
  const { isConnected, aaWalletAddress } = useWalletStore();
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

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono scanlines">
      <Header />
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
              &gt; NFT_COLLECTIONS &lt;
            </h1>
            <p className="text-green-400 text-lg tracking-wider">
              YOUR MINTED GAMING NFTS
            </p>
          </div>
          <div className="mb-8 flex justify-center">
            {isConnected && (
              <Button onClick={loadNFTs} className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                Refresh
              </Button>
            )}
          </div>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <Button onClick={loadNFTs} className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                Try Again
              </Button>
            </div>
          ) : nfts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-cyan-200 py-12">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 opacity-60">
                <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="2" />
                <path d="M8 12h8M12 8v8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-xl font-bold mb-2">
                {isConnected
                  ? "No NFTs found"
                  : "Wallet not connected"}
              </div>
              <div className="text-green-400 text-base">
                {isConnected
                  ? "You don't have any NFTs yet. Mint your first one!"
                  : "Connect your wallet to view your NFT collections."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <Card key={nft.id || nft.tokenId} className="bg-black border-cyan-400 border-2 overflow-hidden hover:border-green-400 transition-colors group cursor-pointer">
                  <div className="relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={`font-mono ${rarityColors[nft.rarity] || rarityColors["Common"]}`}>
                        {nft.rarity || "Common"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2 tracking-wider">
                      {nft.name}
                    </h3>
                    <p className="text-sm text-green-400 mb-4 line-clamp-2">
                      {nft.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-400">ID: {nft.tokenId}</span>
                      {/* Add more NFT info or actions here if needed */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;