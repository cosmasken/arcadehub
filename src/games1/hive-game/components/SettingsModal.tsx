
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Slider } from "../../../components/ui/slider";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMutedChange: (muted: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  volume,
  onVolumeChange,
  isMuted,
  onMutedChange
}) => {
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [colorTheme, setColorTheme] = useState("amber");

  const colorThemes = [
    { id: "amber", name: "Honey Amber", color: "bg-amber-500" },
    { id: "blue", name: "Sky Blue", color: "bg-blue-500" },
    { id: "green", name: "Nature Green", color: "bg-green-500" },
    { id: "purple", name: "Royal Purple", color: "bg-purple-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">⚙️ Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Audio Settings */}
          <Card className="p-4">
            <h3 className="font-semibold text-amber-800 mb-4">🔊 Audio</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-toggle">Mute Sounds</Label>
                <Switch
                  id="mute-toggle"
                  checked={isMuted}
                  onCheckedChange={onMutedChange}
                />
              </div>
              <div>
                <Label className="block mb-2">Volume: {volume}%</Label>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => onVolumeChange(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={isMuted}
                />
              </div>
            </div>
          </Card>

          {/* Haptic Feedback */}
          <Card className="p-4">
            <h3 className="font-semibold text-amber-800 mb-4">📱 Haptic Feedback</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="haptic-toggle">Enable Vibration</Label>
              <Switch
                id="haptic-toggle"
                checked={hapticFeedback}
                onCheckedChange={setHapticFeedback}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Feel vibrations when clicking (mobile only)
            </p>
          </Card>

          {/* Color Theme */}
          <Card className="p-4">
            <h3 className="font-semibold text-amber-800 mb-4">🎨 Color Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={colorTheme === theme.id ? "default" : "outline"}
                  onClick={() => setColorTheme(theme.id)}
                  className="flex items-center gap-2 h-12"
                >
                  <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                  {theme.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Game Data */}
          <Card className="p-4">
            <h3 className="font-semibold text-amber-800 mb-4">💾 Game Data</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Save Data
              </Button>
              <Button variant="outline" className="w-full">
                Import Save Data
              </Button>
              <Button variant="destructive" className="w-full">
                Reset All Progress
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
