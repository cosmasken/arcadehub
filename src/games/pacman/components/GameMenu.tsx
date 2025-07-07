import React from 'react';
import { Play, Pause, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../constants';

interface GameMenuProps {
  gameState: GameState;
  score: number;
  highScore: number;
  level: number;
  soundEnabled: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleSound: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  gameState,
  score,
  highScore,
  level,
  soundEnabled,
  onStart,
  onResume,
  onRestart,
  onHome,
  onToggleSound
}) => {
  const getTitle = () => {
    switch (gameState) {
      case 'menu': return 'PAC-MAN';
      case 'paused': return 'PAUSED';
      case 'game_over': return 'GAME OVER';
      case 'level_complete': return 'LEVEL COMPLETE!';
      default: return 'PAC-MAN';
    }
  };
  
  const getMainButton = () => {
    const buttonClass = "w-full py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3 flex items-center justify-center gap-2";
    
    switch (gameState) {
      case 'menu':
        return (
          <button
            onClick={onStart}
            className={`${buttonClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black`}
          >
            <Play className="w-5 h-5" />
            START GAME
          </button>
        );
      
      case 'paused':
        return (
          <button
            onClick={onResume}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white`}
          >
            <Play className="w-5 h-5" />
            RESUME
          </button>
        );
      
      case 'game_over':
      case 'level_complete':
        return (
          <button
            onClick={onRestart}
            className={`${buttonClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black`}
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>
        );
      
      default:
        return null;
    }
  };
  
  const showMenu = gameState !== 'playing';
  
  if (!showMenu) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 border border-yellow-500/50 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6 font-mono">
          {getTitle()}
        </h1>
        
        {/* Game Stats */}
        {(gameState === 'game_over' || gameState === 'level_complete') && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300 font-mono">Final Score:</span>
              <span className="text-yellow-400 font-bold font-mono">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300 font-mono">Level Reached:</span>
              <span className="text-blue-400 font-bold font-mono">{level}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300 font-mono">High Score:</span>
              <span className="text-purple-400 font-bold font-mono">{highScore.toLocaleString()}</span>
            </div>
          </div>
        )}
        
        {/* Instructions for new game */}
        {gameState === 'menu' && (
          <div className="mb-6 text-left">
            <h3 className="text-yellow-400 font-bold mb-3 text-center">How to Play</h3>
            <ul className="text-gray-300 text-sm space-y-1 font-mono">
              <li>• Use arrow keys or touch controls to move</li>
              <li>• Collect all dots to complete the level</li>
              <li>• Eat power pellets to chase ghosts</li>
              <li>• Avoid ghosts when they're not scared</li>
              <li>• Earn points for dots, pellets, and ghosts</li>
            </ul>
          </div>
        )}
        
        {/* Level Complete Message */}
        {gameState === 'level_complete' && (
          <div className="mb-6">
            <p className="text-green-400 font-mono text-lg mb-2">Excellent!</p>
            <p className="text-gray-300 font-mono text-sm">
              You cleared Level {level}! Get ready for the next challenge.
            </p>
          </div>
        )}
        
        {/* Main Action Button */}
        {getMainButton()}
        
        {/* Secondary Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onToggleSound}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </button>
            
            <button
              onClick={onHome}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
          
          {gameState !== 'menu' && (
            <button
              onClick={onRestart}
              className="w-full py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>
          )}
        </div>
        
        {/* High Score Display */}
        {gameState === 'menu' && highScore > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm font-mono">
              High Score: <span className="text-purple-400 font-bold">{highScore.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameMenu;
