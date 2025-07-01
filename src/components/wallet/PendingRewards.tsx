import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { PendingReward } from '../../types/supabase';
import { formatCurrency } from '../../lib/utils/format';
import { formatDate } from '../../lib/utils/format';
import { useWalletRewardsStore } from '../../stores/useWalletRewardsStore';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, CheckCircle2, Clock, Gift } from 'lucide-react';

interface PendingRewardsProps {
  rewards: PendingReward[];
  isLoading: boolean;
}

export function PendingRewards({ rewards, isLoading }: PendingRewardsProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { claimReward } = useWalletRewardsStore();

  const handleClaim = async (rewardId: string) => {
    try {
      setClaimingId(rewardId);
      setClaimStatus(null);
      
      const result = await claimReward(rewardId);
      
      if (result.success) {
        setClaimStatus({ type: 'success', message: 'Reward claimed successfully!' });
      } else {
        setClaimStatus({ type: 'error', message: result.error || 'Failed to claim reward' });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setClaimStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to claim reward' 
      });
    } finally {
      setClaimingId(null);
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'TOURNAMENT':
        return 'Tournament Win';
      case 'REFERRAL':
        return 'Referral Bonus';
      case 'AFFILIATE':
        return 'Affiliate Program';
      case 'PROMOTION':
        return 'Promotion';
      default:
        return sourceType;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
        <Gift className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {claimStatus && (
          <Alert variant={claimStatus.type === 'success' ? 'default' : 'destructive'} className="mb-4">
            {claimStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{claimStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{claimStatus.message}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No pending rewards</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formatCurrency(reward.amount)} {reward.token_symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getSourceLabel(reward.source_type)} • Available {formatDate(reward.unlock_at, { relative: true })}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleClaim(reward.id)}
                  disabled={new Date(reward.unlock_at) > new Date() || claimingId === reward.id}
                >
                  {claimingId === reward.id ? 'Claiming...' : 'Claim'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
