import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../types';

interface GameMenuProps {
  type: 'start' | 'pause' | 'gameOver' | 'levelComplete' | null;
  score: number;
  highScore: number;
  level?: number;
  onStart: () => void;
  onRestart: () => void;
  onSave: () => void;
  onQuit: () => void;
  onNextLevel?: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  type,
  score,
  highScore,
  level = 1,
  onStart,
  onRestart,
  onSave,
  onQuit,
  onNextLevel,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();
  if (!type) return null;

  const title = type === 'start' ? 'SNAKE' : 
                type === 'pause' ? 'PAUSED' : 
                type === 'levelComplete' ? 'LEVEL COMPLETE!' : 'GAME OVER';

  // Handle exit to home
  const handleExit = () => {
    navigate('/'); // Navigate to home page
  };

  // Get the appropriate action button based on menu type
  const getActionButton = () => {
    if (type === 'start') {
      return (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Start Game
        </button>
      );
    } else if (type === 'pause') {
      return (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Continue Playing
        </button>
      );
    } else if (type === 'levelComplete') {
      return (
        <button
          onClick={onNextLevel}
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Next Level
        </button>
      );
    } else { // gameOver
      return (
        <button
          onClick={onRestart}
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
            <button
              onClick={onSave}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium font-bold transition-all"
            >
              Save Game
            </button>
          )}
          {(type === 'pause' || type === 'gameOver') && (
            <button
              onClick={onRestart}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              New Game
            </button>
          )}
          
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-full bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white py-2 px-4 rounded-lg text-sm font-medium border border-gray-600 hover:border-gray-500 transition-colors"
          >
            Exit
          </button>
          
          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">Exit Game?</h3>
                <p className="text-gray-300 mb-5">Are you sure you want to exit? Your progress will be saved automatically.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleExit();
                      setShowExitConfirm(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Exit to Home
                  </button>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
