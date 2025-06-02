
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

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
  onClose: () => void;
  history: GameSession[];
}

export const HistoryModal = ({ open, onClose, history }: HistoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🕒 Game History</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No game sessions yet!</p>
          ) : (
            history.map((session) => (
              <Card key={session.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{session.date}</div>
                    <div className="text-sm text-gray-600">Duration: {session.duration}</div>
                    <div className="text-sm text-gray-600">Reason: {session.endReason}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600">🍯 {session.score}</div>
                    <div className="text-sm text-gray-600">{session.clicks} clicks</div>
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
