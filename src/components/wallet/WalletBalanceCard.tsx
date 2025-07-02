import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils/format';
import { ERC20Balance } from '../../stores/useWalletRewardsStore';

interface WalletBalanceCardProps {
  balances: Record<string, ERC20Balance> | null;
  isLoading: boolean;
}

export function WalletBalanceCard({ balances, isLoading }: WalletBalanceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : balances ? (
          <div className="space-y-2">
            {Object.entries(balances).map(([symbol, { balance, address }]) => (
              <div key={symbol} className="flex items-center justify-between border-b border-gray-700 py-1">
                <span className="font-bold text-cyan-400">{symbol}</span>
                <span className="text-yellow-400 font-mono">{formatCurrency(balance)} {symbol}</span>
                {/* <span className="text-xs text-gray-500">{address.slice(0, 6)}...{address.slice(-4)}</span> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No balances found.</div>
        )}
      </CardContent>
    </Card>
  );
}
