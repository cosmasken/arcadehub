import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { WalletTransaction, TransactionType } from '../../types/supabase';
import { formatCurrency } from '../../lib/utils/format';
import { formatDate } from '../../lib/utils/format';
import { ArrowDown, ArrowUp, Clock, Award, ShoppingCart, RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'DEPOSIT':
      return <ArrowDown className="h-4 w-4 text-green-500" />;
    case 'WITHDRAWAL':
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    case 'REWARD':
    case 'TOURNAMENT_WIN':
      return <Award className="h-4 w-4 text-yellow-500" />;
    case 'PURCHASE':
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case 'REFUND':
      return <RefreshCw className="h-4 w-4 text-purple-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getTransactionLabel = (type: TransactionType) => {
  switch (type) {
    case 'DEPOSIT':
      return 'Deposit';
    case 'WITHDRAWAL':
      return 'Withdrawal';
    case 'REWARD':
      return 'Reward';
    case 'TOURNAMENT_WIN':
      return 'Tournament Win';
    case 'PURCHASE':
      return 'Purchase';
    case 'REFUND':
      return 'Refund';
    default:
      return 'Transaction';
  }
};

export function TransactionHistory({ transactions, isLoading, onLoadMore, hasMore = false }: TransactionHistoryProps) {
  if (isLoading && transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => {
            const isPositive = ['DEPOSIT', 'REWARD', 'TOURNAMENT_WIN', 'REFUND'].includes(tx.type);
            const amount = parseFloat(tx.amount);
            
            return (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getTransactionIcon(tx.type as TransactionType)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {getTransactionLabel(tx.type as TransactionType)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(tx.created_at, { format: 'MMM d, yyyy h:mm a' })}
                      {tx.tx_hash && (
                        <span className="ml-2 truncate max-w-[100px] inline-block align-middle">
                          • {tx.tx_hash.substring(0, 6)}...{tx.tx_hash.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : '-'}{formatCurrency(amount)} {tx.token_symbol}
                </div>
              </div>
            );
          })}
        </div>
        
        {hasMore && onLoadMore && (
          <div className="mt-4 text-center">
            <button
              onClick={onLoadMore}
              className="text-sm text-primary hover:underline focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
