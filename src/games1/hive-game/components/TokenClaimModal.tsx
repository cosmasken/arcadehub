
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

interface TokenClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimableTokens: number;
  onClaim: () => void;
}

export const TokenClaimModal: React.FC<TokenClaimModalProps> = ({
  open,
  onOpenChange,
  claimableTokens,
  onClaim
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 Tokens Ready!</DialogTitle>
        </DialogHeader>
        
        <Card className="p-6 bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300">
          <div className="text-center space-y-4">
            <div className="text-6xl">🪙</div>
            <div>
              <h3 className="text-xl font-bold text-amber-800">
                {claimableTokens.toLocaleString()} Tokens Available!
              </h3>
              <p className="text-amber-600 text-sm mt-2">
                You've reached the claiming threshold. Claim your tokens now!
              </p>
            </div>
            
            <Button
              onClick={onClaim}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3"
            >
              🪙 Claim Tokens
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
