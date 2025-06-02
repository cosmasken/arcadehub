
import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Play, Pause, Save, RotateCcw } from "lucide-react";

interface GameModalsProps {
  showStartModal: boolean;
  showPauseModal: boolean;
  showSaveModal: boolean;
  onStartGame: () => void;
  onResumeGame: () => void;
  onSaveGame: () => void;
  onResetGame: () => void;
  onCloseSaveModal: () => void;
  gameStats: {
    points: number;
    totalClicks: number;
    timePlayed: string;
  };
}

export const GameModals: React.FC<GameModalsProps> = ({
  showStartModal,
  showPauseModal,
  showSaveModal,
  onStartGame,
  onResumeGame,
  onSaveGame,
  onResetGame,
  onCloseSaveModal,
  gameStats
}) => {
  return (
    <>
      {/* Start Game Modal */}
      <Dialog open={showStartModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🍯 Honey Clicker</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-center text-gray-600">
              Welcome to Honey Clicker! Click the honey jar to collect sweet nectar and build your bee empire.
            </p>
            <Button onClick={onStartGame} className="w-full bg-amber-500 hover:bg-amber-600">
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Modal */}
      <Dialog open={showPauseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Game Paused</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-4 bg-amber-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Points</div>
                  <div className="text-amber-800">🍯 {Math.floor(gameStats.points)}</div>
                </div>
                <div>
                  <div className="font-semibold">Clicks</div>
                  <div className="text-amber-800">{gameStats.totalClicks}</div>
                </div>
              </div>
            </Card>
            <div className="space-y-2">
              <Button onClick={onResumeGame} className="w-full bg-green-500 hover:bg-green-600">
                <Play className="mr-2 h-4 w-4" />
                Resume Game
              </Button>
              <Button onClick={onSaveGame} variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Game
              </Button>
              <Button onClick={onResetGame} variant="destructive" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Game Modal */}
      <Dialog open={showSaveModal} onOpenChange={onCloseSaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Game Saved!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-green-600 text-lg">✅</div>
            <p className="text-center text-gray-600">
              Your progress has been saved successfully!
            </p>
            <Button onClick={onCloseSaveModal} className="w-full">
              Continue Playing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
