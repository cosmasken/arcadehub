import Layout from "../components/Layout";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWalletRewardsStore } from '../stores/useWalletRewardsStore';
import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { PendingRewards } from '../components/wallet/PendingRewards';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../stores/useWalletStore';
import { ethers } from 'ethers';
// --- ADDED IMPORTS ---
import { CONFIG } from '../config';
import useProfileStore from '../stores/useProfileStore';
import { achievements as allAchievements } from '../data/achievements';
import type { Achievement } from '../data/achievements';
// Import game-specific achievements
import { ACHIEVEMENTS as TETRIS_ACHIEVEMENTS } from '../games/tetris/constants';
import { ACHIEVEMENTS as SNAKE_ACHIEVEMENTS } from '../games/snake/constants';

export default function WalletPage() {
  const navigate = useNavigate();
    // ERC20 token list (hardcoded as requested)
    const ERC20_TOKENS = useMemo(() => [
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { symbol: 'ARC', address: '0x150E812D3443699e8b829EF6978057Ed7CB47AE6' },
    ], []);
  
    // ERC20 balances state
    const [erc20Balances, setErc20Balances] = useState<Record<string, { balance: string; address: string; decimals: number }>>({});
  
    // Profile/achievements
    const { achievements: userAchievements } = useProfileStore();
    // userAchievements is an array of achievement objects with achievement_id or id
    const mintedAchievementIds = userAchievements?.map((a: { achievement_id?: number; id?: number }) => a.achievement_id ?? a.id) || [];
    // mintedAchievements: Achievement[]`
    const mintedAchievements: Achievement[] = mintedAchievementIds
      .map((id: number | string) => Object.values(allAchievements).find((a: Achievement) => a.id === id))
      .filter(Boolean) as Achievement[];
      
    // Get game-specific achievements that have been minted
    const mintedTetrisAchievementIds = localStorage.getItem('tetris_achievements') ? 
      JSON.parse(localStorage.getItem('tetris_achievements') || '[]') as string[] : [];
    const mintedSnakeAchievementIds = localStorage.getItem('snake_achievements') ? 
      JSON.parse(localStorage.getItem('snake_achievements') || '[]') as string[] : [];
      
    // Format game achievements to match the display format
    type GameAchievementDisplay = {
      id: string;
      title: string;
      emoji: string;
      description: string;
      game: string;
      reward: number;
    };
    
    // Process Tetris achievements
    const tetrisAchievements: GameAchievementDisplay[] = [];
    for (const id of mintedTetrisAchievementIds) {
      const achievement = TETRIS_ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        tetrisAchievements.push({
          id: `tetris_${achievement.id}`,
          title: achievement.name,
          emoji: achievement.icon,
          description: achievement.description,
          game: 'Tetris',
          reward: achievement.reward
        });
      }
    }
    
    // Process Snake achievements
    const snakeAchievements: GameAchievementDisplay[] = [];
    for (const id of mintedSnakeAchievementIds) {
      const achievement = SNAKE_ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        snakeAchievements.push({
          id: `snake_${achievement.id}`,
          title: achievement.name,
          emoji: achievement.icon,
          description: achievement.description,
          game: 'Snake',
          reward: achievement.reward
        });
      }
    }
    
    // Combine all game achievements
    const gameAchievements = [...tetrisAchievements, ...snakeAchievements];
  const {
    walletSummary,
    isLoading,
    error,
    fetchWalletSummary,
    getTransactionHistory,
    fetchAndSyncERC20Balances
  } = useWalletRewardsStore();
  const { toast } = useToast();
  const { aaWalletAddress, isConnected } = useWalletStore();

  // Add type for window.ethereum
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getEthereum = (): any => (window as any).ethereum;

  // Fetch initial data and trigger ERC20 sync
  const [erc20Loading, setErc20Loading] = useState(false);

  useEffect(() => {
    // Only fetch balances if wallet is connected and ethers is available
    const fetchBalances = async () => {
      if (isConnected && aaWalletAddress && getEthereum()) {
        setErc20Loading(true);
        const provider = new ethers.BrowserProvider(getEthereum());
        const ERC20_ABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ];
        const balances: Record<string, { balance: string; address: string; decimals: number }> = {};
        for (const { symbol, address } of ERC20_TOKENS) {
          try {
            const contract = new ethers.Contract(address, ERC20_ABI, provider);
            const [rawBalance, decimals] = await Promise.all([
              contract.balanceOf(aaWalletAddress),
              contract.decimals()
            ]);
            balances[symbol] = {
              balance: ethers.formatUnits(rawBalance, decimals),
              address,
              decimals
            };
          } catch (err) {
            balances[symbol] = { balance: '0', address, decimals: 18 };
          }
        }
        setErc20Balances(balances);
        setErc20Loading(false);
        toast({
          title: 'Token Balances Synced',
          description: 'Your ERC20 token balances have been updated.',
        });
      }
    };
    fetchBalances();
  }, [isConnected, aaWalletAddress, toast, ERC20_TOKENS]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleLoadMore = async () => {
    // Implement pagination if needed
    const currentCount = walletSummary?.recent_transactions.length || 0;
    const moreTransactions = await getTransactionHistory(currentCount + 10);

    if (moreTransactions.length === 0) {
      toast({
        title: 'No more transactions',
        description: 'You have reached the end of your transaction history.',
      });
    }
  };



  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl">
        {/* Back Button */}
        <button
          className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
          onClick={() => navigate(-1)}
        >
          <span className="mr-2">←</span> Back
        </button>
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Wallet & Rewards</h1>
          <p className="text-muted-foreground">
            Manage your wallet balance, view pending rewards, and track your transaction history.
          </p>
        </div>

        <div className="grid gap-6">
          {/* ERC20 Token Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {erc20Loading ? (
              ERC20_TOKENS.map(({ symbol }) => (
                <div key={symbol} className="animate-pulse h-24 bg-muted rounded-lg" />
              ))
            ) : (
              ERC20_TOKENS.map(({ symbol, address }) => {
                const token = erc20Balances[symbol] || { balance: '0', address, decimals: 18 };
                return (
                  <WalletBalanceCard
                    key={symbol}
                    balances={{ [symbol]: token }}
                    isLoading={erc20Loading}
                  />
                );
              })
            )}
          </div>

          {/* Achievements Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Achievements</h2>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                {mintedAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {mintedAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl">
                          {achievement.emoji}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium">{achievement.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No achievements yet.</p>
                )}
              </div>
            </div>
            
            {/* Game-specific achievements section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Game Achievements</h2>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                {gameAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {gameAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <img 
                            src={achievement.emoji} 
                            alt={achievement.title} 
                            className="h-6 w-6" 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium">{achievement.title}</h3>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {achievement.game}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {achievement.description}
                          </p>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Reward: {achievement.reward} coins
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No game achievements unlocked yet. Play games to earn achievements!</p>
                )}
              </div>
            </div>    
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pending Rewards */}
            <PendingRewards
              rewards={walletSummary?.pending_rewards || []}
              isLoading={isLoading}
            />

            {/* Transaction History */}
            <div className="md:col-span-2">
              <TransactionHistory
                transactions={walletSummary?.recent_transactions || []}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                hasMore={true} // You might want to implement pagination logic
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

