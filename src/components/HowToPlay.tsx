import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from './ui/button';

const HowToPlay = ({ gameId }: { gameId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const gameInstructions = {
    'honey-clicker': {
      title: 'How to Play Honey Clicker',
      steps: [
        'Click the honey pot to earn honey points',
        'Use honey to buy upgrades that generate honey automatically',
        'Unlock achievements and climb the leaderboard',
        'The more honey you collect, the higher your score!'
      ]
    },
    'tetris': {
      title: 'How to Play Tetris',
      steps: [
        'Use arrow keys to move and rotate pieces',
        'Complete lines to clear them and earn points',
        'The game speeds up as you level up',
        'Press Space to instantly drop a piece',
        'Press P to pause the game'
      ]
    },
    'default': {
      title: 'How to Play',
      steps: [
        'Select a game from the menu to get started',
        'Follow the on-screen instructions for each game',
        'Earn points and climb the leaderboard',
        'Connect your wallet to earn tokens and rewards',
        'Have fun and play responsibly!'
      ]
    }
  };

  const instructions = gameId && gameInstructions[gameId as keyof typeof gameInstructions] 
    ? gameInstructions[gameId as keyof typeof gameInstructions] 
    : gameInstructions.default;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="How to play"
      >
        <Info className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-cyan-400 mb-4">
          {instructions.title}
        </h2>
        
        <ul className="space-y-3 mb-6">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
