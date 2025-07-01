import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { WalletBalance } from '../../types/supabase';
import { formatCurrency } from '../../lib/utils/format';

interface WalletBalanceCardProps {
  balance: WalletBalance | null;
  isLoading: boolean;
}

export function WalletBalanceCard({ balance, isLoading }: WalletBalanceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {formatCurrency(balance?.total_balance || '0')} NERO
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(balance?.available_balance || '0')} available • {formatCurrency(balance?.locked_balance || '0')} locked
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
