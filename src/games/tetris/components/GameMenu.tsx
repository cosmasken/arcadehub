import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Play, RotateCcw, Home, Settings, Award, ShoppingCart } from 'lucide-react';
import useWalletStore from '../../../stores/useWalletStore';

interface GameMenuProps {
  type: 'start' | 'pause' | 'gameOver' | null;
  score: number;
  highScore: number;
  level?: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleShop?: () => void;
  onToggleAchievements?: () => void;
  onToggleSettings?: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  type,
  score,
  highScore,
  level = 1,
  onStart,
  onResume,
  onRestart,
  onQuit,
  onToggleShop,
  onToggleAchievements,
  onToggleSettings,
}) => {
  const navigate = useNavigate();
  const { isConnected, connect } = useWalletStore();
  
  if (!type) return null;

  const title = type === 'start' ? 'TETRIS' : 
                type === 'pause' ? 'PAUSED' : 'GAME OVER';

  const handleStartWithConnection = async () => {
    if (!isConnected) {
      try {
        await connect();
        // Auto-start after successful connection
        onStart();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      onStart();
    }
  };

  const getActionButton = () => {
    if (type === 'start') {
      return (
        <Button
          onClick={handleStartWithConnection}
          className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          {isConnected ? 'Start Game' : 'Connect Wallet'}
        </Button>
      );
    } else if (type === 'pause') {
      return (
        <>
          <Button
            onClick={onResume}
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white mb-3"
            size="lg"
          >
            Resume Game
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full py-6 text-lg mb-3"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Restart
          </Button>
        </>
      );
    } else { // gameOver
      return (
        <Button
          onClick={onRestart}
          className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white mb-3"
          size="lg"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 font-mono">{title}</h1>
          
          {(type === 'gameOver' || type === 'pause') && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Score:</span>
                <span className="font-bold text-white">{score}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">High Score:</span>
                <span className="font-bold text-yellow-400">{highScore}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Level:</span>
                <span className="font-bold text-blue-400">{level}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {getActionButton()}
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {onToggleSettings && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onToggleSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
            
            {onToggleAchievements && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onToggleAchievements}
              >
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </Button>
            )}
            
            {onToggleShop && isConnected && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onToggleShop}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shop
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full text-red-400 hover:bg-red-900/50 hover:text-red-300"
              onClick={onQuit}
            >
              <Home className="mr-2 h-4 w-4" />
              Quit to Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
