import React, { useState } from 'react';
import { Button } from '../ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface TokenApprovalProps {
  selectedToken: string;
  onApprovalComplete: () => void;
}

const TokenApproval: React.FC<TokenApprovalProps> = ({
  selectedToken,
  onApprovalComplete,
}) => {
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [approvalError, setApprovalError] = useState<string>('');

  const handleApprove = async () => {
    setIsApproving(true);
    setApprovalError('');

    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsApproved(true);
      onApprovalComplete();
    } catch (error) {
      console.error('Error approving token:', error);
      setApprovalError('Failed to approve token. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  if (!selectedToken) return null;

  return (
    <div className="space-y-3">
      {isApproved ? (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Token approved for gas payment</span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            You need to approve the token to pay for gas fees
          </p>
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              'Approve Token'
            )}
          </Button>
          {approvalError && (
            <p className="text-sm text-red-400">{approvalError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenApproval;
