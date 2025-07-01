import Layout from "../components/Layout";
import { useEffect } from 'react';
import { useWalletRewardsStore } from '../stores/useWalletRewardsStore';
import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { PendingRewards } from '../components/wallet/PendingRewards';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import { useToast } from '../components/ui/use-toast';

export default function WalletPage() {
  const { 
    walletSummary, 
    isLoading, 
    error, 
    fetchWalletSummary, 
    getTransactionHistory 
  } = useWalletRewardsStore();
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    fetchWalletSummary();
  }, [fetchWalletSummary]);

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
