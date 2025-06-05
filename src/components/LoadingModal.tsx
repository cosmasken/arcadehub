
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  transactionText?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = 'PROCESSING',
  description = 'Please wait while we process your request...',
  transactionText = 'Transaction in progress...',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-sm" hideCloseButton>
        <DialogHeader className="text-center">
          <DialogTitle className="text-cyan-400 text-xl neon-text">
            &gt; {title} &lt;
          </DialogTitle>
          <DialogDescription className="text-green-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-green-400 rounded-full animate-pulse opacity-30" />
          </div>
          
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          
          <div className="text-xs text-green-400 animate-pulse">
            {transactionText}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
