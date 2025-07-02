
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Users, Trophy, Star, Wallet, Info } from 'lucide-react';
import Tooltip from './Tooltip';
import useWalletStore from '../stores/useWalletStore';

interface GameCardProps {
  game: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    players: number;
    rating: number;
    prize: string;
    status: 'live' | 'upcoming' | 'completed' | 'beta';
  };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWalletStore();
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isConnected) {
      navigate(`/games/${game.id}`);
    } else {
      connectWallet();
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:scale-105 group bg-gray-900/50 border border-gray-800 hover:border-cyan-400/30">
      <div className="relative">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`${getStatusColor(game.status)} text-white`}>
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </Badge>
          <Tooltip content={`${game.rating}/5 rating from ${game.players.toLocaleString()} players`} position="right">
            <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
          </Tooltip>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 bg-black/50 rounded-lg px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-white">{game.rating}</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Tooltip 
            content={isConnected ? `Play ${game.title} and earn ${game.prize}` : 'Connect your wallet to play and earn rewards'}
            position="top"
          >
            <Button 
              className={`w-full ${isConnected ? 'bg-purple-600 hover:bg-purple-700' : 'bg-yellow-600 hover:bg-yellow-700'} transition-all duration-200`}
              onClick={handlePlayClick}
            >
              {isConnected ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Now
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet to Play
                </>
              )}
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {game.category}
          </Badge>
          <div className="flex items-center space-x-1 text-purple-400">
            <Trophy className="w-3 h-3" />
            <span className="text-xs font-medium">{game.prize}</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
          {game.title}
        </h3>
        
        <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-foreground/60">
            <Users className="w-4 h-4" />
            <span className="text-sm">{game.players.toLocaleString()}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameCard;
