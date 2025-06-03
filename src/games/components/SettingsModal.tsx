import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export const SettingsModal = ({ open, onClose, volume, setVolume }: SettingsModalProps) => {
  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚙️ Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">🔊 Audio Settings</h3>
            <div className="space-y-2">
              <label className="text-sm">Volume: {volume}%</label>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold mb-2">🎮 Game Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Version: 1.0.0</p>
              <p>Created with love for honey enthusiasts! 🍯</p>
            </div>
          </Card>

          <Button onClick={onClose} className="w-full">
            Close Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
