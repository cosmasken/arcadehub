
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  Trophy, 
  Clock, 
  Users, 
  DollarSign,
  Wallet,
  AlertTriangle
} from 'lucide-react';

interface Tournament {
  id: number;
  title: string;
  game: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  status: string;
  duration: string;
  entryFee: string;
}

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (tournamentId: number, agreedToTerms: boolean) => void;
  tournament: Tournament | null;
}

const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  tournament
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = () => {
    if (tournament && agreedToTerms) {
      onRegister(tournament.id, agreedToTerms);
      onClose();
      setAgreedToTerms(false);
    }
  };

  if (!tournament) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-cyan-400 text-green-400 font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-xl neon-text">
            &gt; TOURNAMENT_REGISTRATION &lt;
          </DialogTitle>
          <DialogDescription className="text-green-400">
            Register for {tournament.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tournament Info */}
          <div className="border border-cyan-400 p-4 rounded bg-black/50">
            <h3 className="text-cyan-400 font-bold mb-2">{tournament.title}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-green-400">GAME:</p>
                <p className="text-cyan-400">{tournament.game}</p>
              </div>
              <div>
                <p className="text-green-400">PRIZE:</p>
                <p className="text-yellow-400 font-bold">{tournament.prize}</p>
              </div>
              <div>
                <p className="text-green-400">ENTRY FEE:</p>
                <p className="text-cyan-400 font-bold">{tournament.entryFee}</p>
              </div>
              <div>
                <p className="text-green-400">DURATION:</p>
                <p className="text-cyan-400">{tournament.duration}</p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-green-400 rounded">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-green-400 text-sm">ENTRY FEE REQUIRED</p>
                <p className="text-cyan-400 font-bold">{tournament.entryFee}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-green-400 rounded">
              <Users className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-green-400 text-sm">SPOTS REMAINING</p>
                <p className="text-cyan-400 font-bold">
                  {tournament.maxParticipants - tournament.participants} / {tournament.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-green-400 rounded">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 text-sm">START TIME</p>
                <p className="text-cyan-400 font-bold">{tournament.startTime}</p>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="border border-yellow-400 p-3 rounded bg-yellow-400/10">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">IMPORTANT</p>
                <p className="text-green-400 text-xs">
                  Entry fees are non-refundable. By registering, you agree to the tournament rules and terms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              className="border-cyan-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:text-black"
            />
            <label htmlFor="terms" className="text-green-400 text-sm cursor-pointer">
              I agree to the tournament terms and conditions
            </label>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleRegister}
            disabled={!agreedToTerms}
            className="bg-green-400 text-black hover:bg-cyan-400 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4 mr-2" />
            REGISTER ({tournament.entryFee})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentRegistrationModal;
