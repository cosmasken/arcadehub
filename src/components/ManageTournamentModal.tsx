import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  Settings, 
  Coins, 
  Users, 
  Calendar, 
  Trophy,
  Plus,
  Minus,
  Edit,
  Pause,
  Play,
  Square
} from 'lucide-react';

interface ManageTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
}

const ManageTournamentModal = ({ isOpen, onClose, tournament }: ManageTournamentModalProps) => {
  const { toast } = useToast();
  const [additionalFunds, setAdditionalFunds] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!tournament) return null;

  const handleAddFunds = async () => {
    if (!additionalFunds || parseFloat(additionalFunds) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Funds Added Successfully!",
        description: `Added ${additionalFunds} ETH to ${tournament.title}`,
        className: "bg-green-400 text-black border-green-400",
      });
      
      setAdditionalFunds('');
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTournamentAction = async (action: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: `Tournament ${action}d!`,
        description: `Successfully ${action}d ${tournament.title}`,
        className: "bg-green-400 text-black border-green-400",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} tournament. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-400 text-black animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-400 text-black">UPCOMING</Badge>;
      case 'completed':
        return <Badge className="bg-gray-400 text-black">COMPLETED</Badge>;
      default:
        return <Badge className="bg-cyan-400 text-black">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-green-400 text-green-400 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-xl">
            &gt; MANAGE_TOURNAMENT &lt;
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-cyan-400 font-mono">
                  {tournament.title}
                </h2>
                {getStatusBadge(tournament.status)}
              </div>
              <p className="text-green-400">{tournament.game}</p>
            </div>
          </div>

          {/* Prize Pool Management */}
          <Card className="bg-black border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                PRIZE_POOL_MANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-400">CURRENT_PRIZE_POOL</Label>
                  <div className="text-2xl font-bold text-yellow-400 font-mono">
                    {tournament.prizePool}
                  </div>
                </div>
                <div>
                  <Label className="text-green-400">YOUR_CONTRIBUTION</Label>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {tournament.yourContribution}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalFunds" className="text-green-400">
                  ADD_ADDITIONAL_FUNDS (ETH)
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="additionalFunds"
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={additionalFunds}
                    onChange={(e) => setAdditionalFunds(e.target.value)}
                    className="bg-black border-green-400 text-green-400 font-mono"
                  />
                  <Button
                    onClick={handleAddFunds}
                    disabled={isLoading || !additionalFunds}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    ADD_FUNDS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournament Controls */}
          <Card className="bg-black border-2 border-cyan-400">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                TOURNAMENT_CONTROLS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tournament.status === 'upcoming' && (
                  <Button
                    onClick={() => handleTournamentAction('start')}
                    disabled={isLoading}
                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    START
                  </Button>
                )}
                
                {tournament.status === 'live' && (
                  <>
                    <Button
                      onClick={() => handleTournamentAction('pause')}
                      disabled={isLoading}
                      className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      PAUSE
                    </Button>
                    <Button
                      onClick={() => handleTournamentAction('end')}
                      disabled={isLoading}
                      variant="outline"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-mono"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      END
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => handleTournamentAction('edit')}
                  disabled={isLoading || tournament.status === 'completed'}
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  EDIT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Statistics */}
          <Card className="bg-black border-2 border-green-400">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                LIVE_STATISTICS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-400 font-mono">
                    {tournament.participants}
                  </div>
                  <div className="text-green-400 text-sm">PARTICIPANTS</div>
                </div>
                
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    72H
                  </div>
                  <div className="text-green-400 text-sm">TIME_LEFT</div>
                </div>
                
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-yellow-400 font-mono">
                    #1
                  </div>
                  <div className="text-green-400 text-sm">TRENDING</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono"
            >
              SAVE_CHANGES
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

export default ManageTournamentModal;
