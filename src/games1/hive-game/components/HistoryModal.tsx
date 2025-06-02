
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

interface GameSession {
  id: string;
  date: string;
  duration: string;
  score: number;
  clicks: number;
  endReason: string;
}

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameHistory: GameSession[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  open,
  onOpenChange,
  gameHistory
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">📊 Game History</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {gameHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🍯</div>
              <p>No game sessions yet!</p>
              <p className="text-sm">Start playing to see your history here.</p>
            </div>
          ) : (
            gameHistory.map((session, index) => (
              <Card key={session.id} className="p-4 bg-amber-50 border-amber-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎮</span>
                    <div>
                      <div className="font-semibold text-amber-800">
                        Session #{gameHistory.length - index}
                      </div>
                      <div className="text-sm text-amber-600">{session.date}</div>
                    </div>
                  </div>
                  <Badge 
                    variant={session.endReason === 'Game Reset' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {session.endReason}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-amber-800">🍯 {session.score}</div>
                    <div className="text-amber-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-800">{session.clicks}</div>
                    <div className="text-amber-600">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-800">{session.duration}</div>
                    <div className="text-amber-600">Duration</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
