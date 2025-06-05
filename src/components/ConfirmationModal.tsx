
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'success' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  variant = 'info'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      default:
        return <Info className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-400';
      case 'success':
        return 'border-green-400';
      default:
        return 'border-cyan-400';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`bg-black border-2 ${getVariantClasses()} text-green-400 font-mono max-w-md`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-cyan-400 text-lg neon-text flex items-center space-x-2">
            {getIcon()}
            <span>&gt; {title} &lt;</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-green-400 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="space-x-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
