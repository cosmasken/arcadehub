import React from 'react';
import { ArrowLeft, Star, Users, Share, Heart } from 'lucide-react';
import { Game } from '../pages/Index';
import HoneyClicker from '../games/HoneyClicker';

interface GameViewProps {
  game: Game;
  onBack: () => void;
}

export const GameView = ({ game, onBack }: GameViewProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button and Game Info */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Games</span>
        </button>
        <div className="flex items-center space-x-4">
          <button className="bg-muted hover:bg-accent text-foreground p-2 rounded-full transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-muted hover:bg-accent text-foreground p-2 rounded-full transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      

      {/* Game Container */}
      <div className="bg-card/90 backdrop-blur-md rounded-xl overflow-hidden border border-border shadow-lg">
        <div className="bg-muted/60 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Now Playing: {game.title}</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-white/80 text-sm">Live</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="h-96 md:h-[600px] bg-gradient-to-br from-background to-muted">
          <HoneyClicker gameName={game.title} />
        </div>
      </div>

      {/* Game Header */}
      <div className="bg-card/90 backdrop-blur-md rounded-xl p-6 mb-6 border border-border shadow-lg">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-32 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
            <p className="text-white/80 mb-4">{game.description}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{game.rating}</span>
                <span className="text-white/60">Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-white">{game.plays}</span>
                <span className="text-white/60">Plays</span>
              </div>
              <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                {game.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls/Info */}
      {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/90 backdrop-blur-md rounded-xl p-6 border border-border shadow">
        <h3 className="text-white font-semibold mb-4">Game Controls</h3>
            <div className="space-y-2 text-white/80">
            <p>• Use arrow keys to move</p>
            <p>• Spacebar to jump/action</p>
            <p>• Enter to pause</p>
            <p>• ESC to exit fullscreen</p>
          </div>
        </div>
        
        <div className="bg-card/90 backdrop-blur-md rounded-xl p-6 border border-border shadow">
     <h3 className="text-white font-semibold mb-4">About This Game</h3>
          <p className="text-white/80 mb-4">{game.description}</p>
          <div className="text-sm text-white/60">
            <p>Category: {game.category}</p>
            <p>Rating: {game.rating}/5.0</p>
            <p>Total Plays: {game.plays}</p>
          </div>
        </div>
      </div> */}

    </div>
  );
};
