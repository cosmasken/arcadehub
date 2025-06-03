import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
}

const SaveModal = ({ open, onClose }: SaveModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Game Saved!</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <div className="text-4xl mb-4">💾</div>
          <p className="text-gray-600">Your honey collection progress has been saved successfully!</p>
        </div>
        <Button onClick={onClose} className="w-full">
          Continue Playing
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export const GameModals = {
  SaveModal
};
