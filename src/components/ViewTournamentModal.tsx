/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Trophy, Users, Calendar, Coins, Settings } from 'lucide-react';

interface ViewTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManage: () => void;
  tournament: any;
}

const ViewTournamentModal = ({ isOpen, onClose, onManage, tournament }: ViewTournamentModalProps) => {
  if (!tournament) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-400 text-black animate-pulse">LIVE</Badge>;
      case 'ended':
        return <Badge className="bg-yellow-400 text-black">ENDED</Badge>;
      case 'completed':
        return <Badge className="bg-gray-400 text-black">COMPLETED</Badge>;
      default:
        return <Badge className="bg-cyan-400 text-black">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-green-400 text-green-400 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-xl">
             &gt; TOURNAMENT_DETAILS  &lt;
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">
                  {tournament.title}
                </h2>
                {getStatusBadge(tournament.status)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 text-xl font-bold">{tournament.prizePool} {tournament.tokenSymbol}</p>
              <p className="text-green-400 text-sm">PRIZE POOL</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-black border border-green-400">
              <CardContent className="p-3 text-center">
                <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-400 font-mono">
                  {tournament.participants}
                </div>
                <div className="text-green-400 text-xs">PARTICIPANTS</div>
              </CardContent>
            </Card>
            <Card className="bg-black border border-yellow-400">
              <CardContent className="p-3 text-center">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-yellow-400 font-mono">
                  {tournament.yourContribution} {tournament.tokenSymbol}
                </div>
                <div className="text-green-400 text-xs">YOUR_CONTRIBUTION</div>
              </CardContent>
            </Card>
            <Card className="bg-black border border-cyan-400">
              <CardContent className="p-3 text-center">
                <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-cyan-400 font-mono">
                  {tournament.startTime}
                </div>
                <div className="text-green-400 text-xs">START_DATE</div>
              </CardContent>
            </Card>
            <Card className="bg-black border border-purple-400">
              <CardContent className="p-3 text-center">
                <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-400 font-mono">
                  #1
                </div>
                <div className="text-green-400 text-xs">TRENDING</div>
              </CardContent>
            </Card>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-400">TOURNAMENT PROGRESS</span>
              <span className="text-cyan-400">
                {tournament.status === 'completed' ? '100%' : tournament.status === 'live' ? '60%' : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-800 h-2 border border-green-400">
              <div
                className={`h-full transition-all duration-300 ${tournament.status === 'completed' ? 'bg-green-400' : tournament.status === 'live' ? 'bg-yellow-400' : 'bg-gray-600'}`}
                style={{ width: tournament.status === 'completed' ? '100%' : tournament.status === 'live' ? '60%' : '0%' }}
              ></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onManage}
              className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono"
            >
              <Settings className="w-4 h-4 mr-2" />
              MANAGE_TOURNAMENT
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
            >
              CLOSE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTournamentModal;
