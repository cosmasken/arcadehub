
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  genre: string;
  plays: number;
  rating: number;
  developer?: string;
  url?: string; // Add optional url property
}

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <div className="arcade-card overflow-hidden group">
      <div className="relative">
        <img 
          src={game.thumbnail} 
          alt={game.title}
          className="w-full h-48 object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-white">
          {game.genre}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{game.title}</h3>
        
        <div className="flex items-center text-xs text-white/70 mb-3">
          <span className="flex items-center">
            <Star size={12} className="text-arcade-yellow mr-1" fill="currentColor" />
            {game.rating}
          </span>
          <span className="mx-2">•</span>
          <span>{game.plays.toLocaleString()} Plays</span>
          {game.developer && (
            <>
              <span className="mx-2">•</span>
              <span>By {game.developer}</span>
            </>
          )}
        </div>
        
        <div className="flex">
          <Button 
            asChild
            className="w-full bg-arcade-blue hover:bg-arcade-blue/80 text-white transition-transform duration-200 hover:translate-y-[-2px]"
          >
            <Link to={`/game/${game.id}`}>
              Play Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
