import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameState } from '../context/GameStateContext';
import { useGame } from '../context';

interface GameMenuProps {
  onStart?: () => void;
  onRestart?: () => void;
  onSave?: () => void;
  onQuit?: () => void;
  onNextLevel?: () => void;
}

const GameMenu: React.FC<Partial<GameMenuProps>> = ({
  onStart,
  onRestart,
  onSave,
  onQuit,
  onNextLevel,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { state: gameState, playSound } = useGameState();
  const { state } = useGame();
  
  // Derive menu type from game state
  const type = state.gameOver ? 'gameOver' : 
               state.menuType === 'levelComplete' ? 'levelComplete' : 
               state.isPaused ? 'pause' : 'start';
  
  // Get score, highScore, and level from game state
  const score = state.score;
  const highScore = state.highScore;
  const level = state.level;
  if (!type) return null;

  const title = type === 'start' ? 'SNAKE' : 
                type === 'pause' ? 'PAUSED' : 
                type === 'levelComplete' ? 'LEVEL COMPLETE!' : 'GAME OVER';

  // Handle exit to home
  const handleExit = () => {
    // Navigate to home page
  };

  // Get the appropriate action button based on menu type
  const getActionButton = () => {
    if (type === 'start') {
      return (
        <button
          onClick={() => {
            if (onStart) onStart();
            playSound('click');
          }}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Start Game
        </button>
      );
    } else if (type === 'pause') {
      return (
        <button
          onClick={() => {
            if (onStart) onStart();
            playSound('click');
          }}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Continue Playing
        </button>
      );
    } else if (type === 'levelComplete') {
      return (
        <button
          onClick={() => {
            if (onNextLevel) onNextLevel();
            playSound('click');
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Next Level
        </button>
      );
    } else { // gameOver
      return (
        <button
          onClick={() => {
            if (onRestart) onRestart();
            playSound('click');
          }}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Play Again
        </button>
      );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
      <div className="bg-gray-900/95 p-8 rounded-xl border border-cyan-400/20 shadow-2xl w-full max-w-sm transform transition-all duration-300 hover:shadow-cyan-500/20">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-2">
          {title}
        </h2>
        
        {/* Score Display */}
        {(type === 'pause' || type === 'gameOver' || type === 'levelComplete') && (
          <div className="text-center mb-6">
            <p className="text-lg text-gray-300">
              Score: <span className="text-cyan-400 font-bold">{score}</span>
            </p>
            {highScore > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                High Score: <span className="text-yellow-400 font-bold">{highScore}</span>
              </p>
            )}
            {type === 'levelComplete' && (
              <p className="text-green-400 mt-2 font-semibold">Level {level} Complete!</p>
            )}
          </div>
        )}

        {/* Game Instructions */}
        {type === 'start' && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700/50">
            <p className="text-sm text-gray-300 text-center">
              Use {window.innerWidth < 640 ? 'swipe' : 'arrow keys'} to move
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Eat food to grow and set a new high score!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {getActionButton()}
          
          {/* Additional options */}
          {(type === 'pause' || type === 'gameOver') && onSave && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (onRestart) onRestart();
                  playSound('click');
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium font-bold transition-all"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => {
                  if (onSave) onSave();
                  playSound('click');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium font-bold transition-all"
              >
                SAVE SCORE
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(true);
                  playSound('click');
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg text-sm font-medium font-bold transition-all"
              >
                EXIT
              </button>
            </div>
          )}
          
          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900/90 p-6 rounded-lg border border-cyan-400/30 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Confirm Exit</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to exit? Your progress will be lost.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      if (onQuit) onQuit();
                      playSound('click');
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Yes, Exit
                  </button>
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      playSound('click');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
