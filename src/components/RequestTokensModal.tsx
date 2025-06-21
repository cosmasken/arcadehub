import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Coins } from 'lucide-react';

interface RequestTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequest: () => void;
  isRequesting: boolean;
}

const RequestTokensModal: React.FC<RequestTokensModalProps> = ({
  isOpen,
  onClose,
  onRequest,
  isRequesting,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-black border-2 border-yellow-400 text-green-400 font-mono max-w-md">
      <DialogHeader>
        <DialogTitle className="text-yellow-400 text-xl neon-text flex items-center">
          <Coins className="w-5 h-5 mr-2" />
          GET TEST TOKENS
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-green-400 mb-4">
          Need tokens to play and test? Click below to receive free test ARC tokens for the NERO testnet.
        </p>
      </div>
      <DialogFooter className="space-x-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
        >
          CANCEL
        </Button>
        <Button
          onClick={onRequest}
          className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono"
          disabled={isRequesting}
        >
          {isRequesting ? "REQUESTING..." : "GET TEST TOKENS"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RequestTokensModal;