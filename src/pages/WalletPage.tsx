import Layout from "../components/Layout";
import { useEffect, useState } from 'react';
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

export default function WalletPage() {
  const navigate = useNavigate();
    // ERC20 token list (hardcoded as requested)
    const ERC20_TOKENS = [
      { symbol: 'DAI', address: '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345' },
      { symbol: 'USDT', address: '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74' },
      { symbol: 'USDC', address: '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed' },
      { symbol: 'ARC', address: '0x150E812D3443699e8b829EF6978057Ed7CB47AE6' },
    ];
  
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
  }, [isConnected, aaWalletAddress, toast]);

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
          <div>
            <h2 className="text-2xl font-semibold mb-2">Achievements</h2>
            {mintedAchievements.length === 0 ? (
              <div className="text-gray-400">No achievements minted yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mintedAchievements.map(ach => (
                  <div key={ach.id} className="border rounded-lg p-4 flex flex-col items-center bg-gray-900">
                    <span className="text-4xl mb-2">{ach.emoji}</span>
                    <span className="font-bold text-lg">{ach.title}</span>
                    <span className="text-sm text-gray-400 text-center">{ach.description}</span>
                  </div>
                ))}
              </div>
            )}
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

