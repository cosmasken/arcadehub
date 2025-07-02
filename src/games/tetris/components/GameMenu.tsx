import React from 'react';
import { useGame } from '../context';
// Temporary mock for wallet store
const useWalletStore = () => ({
  isConnected: false,
  connect: () => {}
});
import { Button } from '../../../components/ui/button';
import { Play, Settings, Award, ShoppingCart, LogIn } from 'lucide-react';

const GameMenu: React.FC = () => {
  const { state } = useGame();
  const { isConnected, connect } = useWalletStore();
  const { isStarted, isPaused, gameOver } = state;
  
  // Mock functions for now - these should be implemented in the game context
  const startGame = () => {};
  const resetGame = () => {};

  const handleStartGame = () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (gameOver) {
      resetGame();
    } else {
      startGame();
    }
  };

  if (isStarted && !isPaused && !gameOver) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-background p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center mb-6">
          {gameOver ? 'Game Over' : 'Tetris'}
        </h2>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={handleStartGame}
            className="w-full py-6 text-lg"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {gameOver ? 'Play Again' : 'Start Game'}
          </Button>
          
          {!isConnected && (
            <Button 
              onClick={connect}
              variant="outline"
              className="w-full py-6 text-lg"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" className="w-full">
              <Award className="mr-2 h-4 w-4" />
              Achievements
            </Button>
            <Button variant="outline" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
