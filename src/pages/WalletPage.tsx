import Layout from "../components/Layout";
import { useEffect } from 'react';
import { useWalletRewardsStore } from '../stores/useWalletRewardsStore';
import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { PendingRewards } from '../components/wallet/PendingRewards';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../stores/useWalletStore';
import { ethers } from 'ethers';

export default function WalletPage() {
  const navigate = useNavigate();
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
  useEffect(() => {
    fetchWalletSummary();
    // Only sync if wallet is connected and ethers is available
    if (isConnected && aaWalletAddress && getEthereum()) {
      const provider = new ethers.BrowserProvider(getEthereum());
      fetchAndSyncERC20Balances(provider, aaWalletAddress)
        .then((balances) => {
          if (balances) {
            toast({
              title: 'Token Balances Synced',
              description: 'Your ERC20 token balances have been updated.',
            });
          }
        })
        .catch((err) => {
          toast({
            title: 'Token Sync Error',
            description: err?.message || 'Failed to sync token balances',
            variant: 'destructive',
          });
        });
    }
  }, [fetchWalletSummary, fetchAndSyncERC20Balances, isConnected, aaWalletAddress, toast]);

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
          {/* Wallet Balance */}
          <WalletBalanceCard
            balance={walletSummary?.balance || null}
            isLoading={isLoading}
          />

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
