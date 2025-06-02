
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TokenClaimModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
  tokens: number;
}

export const TokenClaimModal = ({ open, onClose, onClaim, tokens }: TokenClaimModalProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    
    // Show success animation
    setTimeout(() => {
      setIsClaiming(false);
      setShowSuccess(true);
      onClaim();
      
      // Auto close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="transition-all duration-300 bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            {showSuccess ? "🎉 Success!" : "🪙 Claim Your Tokens!"}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-6">
          {showSuccess ? (
            <div className="animate-scale-in">
              <div className="text-6xl mb-4 animate-bounce">✨</div>
              <h3 className="text-xl font-bold mb-2 text-green-600">Tokens Claimed!</h3>
              <p className="text-gray-600 mb-4">
                You've successfully claimed {tokens} tokens!
              </p>
              <div className="text-2xl font-bold text-amber-600">
                Keep collecting honey! 🍯
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className={`text-6xl mb-4 transition-all duration-500 ${isClaiming ? 'animate-spin' : ''}`}>
                🪙
              </div>
              <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
              <p className="text-gray-600 mb-4">
                You've earned enough honey to claim special tokens!
              </p>
              <div className="text-2xl font-bold text-amber-600 mb-4 animate-pulse">
                {tokens} Tokens Available
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleClaim} 
                  disabled={isClaiming}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 transition-all duration-200 hover:scale-105"
                >
                  {isClaiming ? "Claiming..." : "Claim Tokens"}
                </Button>
                <Button 
                  onClick={onClose} 
                  variant="outline" 
                  className="flex-1 transition-all duration-200 hover:scale-105"
                  disabled={isClaiming}
                >
                  Later
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
