import React, { useState } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useGame } from '../context';
import { useNavigate } from 'react-router-dom';
import { getMenuType, getScoreDisplay, getGameInstructions } from '../utils/gameStateUtils';

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
  const navigate = useNavigate();
  
  // Use utility functions for cleaner logic
  const menuType = getMenuType(state);
  const scoreDisplay = getScoreDisplay(state);
  const instructions = getGameInstructions(gameState.settings.useWASD);

  const getTitle = () => {
    switch (menuType) {
      case 'start': return 'SNAKE';
      case 'pause': return 'PAUSED';
      case 'levelComplete': return 'LEVEL COMPLETE!';
      case 'gameOver': return 'GAME OVER';
      default: return 'SNAKE';
    }
  };

  const handleExitToHome = () => {
    playSound('click');
    navigate('/');
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    handleExitToHome();
  };

  const getMainButton = () => {
    const buttonClass = "w-full py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3";
    
    switch (menuType) {
      case 'start':
        return (
          <button
            onClick={() => {
              if (onStart) onStart();
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white`}
          >
            🎮 START GAME
          </button>
        );
      
      case 'pause':
        return (
          <button
            onClick={() => {
              if (onStart) onStart();
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white`}
          >
            ▶️ RESUME
          </button>
        );
      
      case 'levelComplete':
        return (
          <button
            onClick={() => {
              if (onNextLevel) onNextLevel();
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white`}
          >
            🚀 NEXT LEVEL
          </button>
        );
      
      case 'gameOver':
        return (
          <button
            onClick={() => {
              if (onRestart) onRestart();
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white`}
          >
            🔄 PLAY AGAIN
          </button>
        );
      
      default:
        return null;
    }
  };

  const getSecondaryButtons = () => {
    const buttonClass = "w-full py-2 px-4 rounded-lg text-sm font-bold transition-all";
    
    if (menuType === 'start') {
      return (
        <div className="space-y-2">
          <button
            onClick={handleExitToHome}
            className={`${buttonClass} bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white`}
          >
            🏠 BACK TO MENU
          </button>
        </div>
      );
    }
    
    if (menuType === 'pause' || menuType === 'gameOver') {
      return (
        <div className="space-y-2">
          <button
            onClick={() => {
              if (onRestart) onRestart();
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white`}
          >
            🔄 RESTART
          </button>
          
          {onSave && (
            <button
              onClick={() => {
                if (onSave) onSave();
                playSound('click');
              }}
              className={`${buttonClass} bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white`}
            >
              💾 SAVE SCORE
            </button>
          )}
          
          <button
            onClick={() => {
              setShowExitConfirm(true);
              playSound('click');
            }}
            className={`${buttonClass} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white`}
          >
            🚪 EXIT TO MENU
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
        <div className="bg-gray-900/95 p-8 rounded-xl border border-cyan-400/20 shadow-2xl w-full max-w-sm transform transition-all duration-300 hover:shadow-cyan-500/20">
          
          {/* Title */}
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4">
            {getTitle()}
          </h2>
          
          {/* Score Display */}
          {(menuType === 'pause' || menuType === 'gameOver' || menuType === 'levelComplete') && (
            <div className="text-center mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="text-2xl text-cyan-400 font-bold mb-1">
                {scoreDisplay.current.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Current Score</div>
              
              {scoreDisplay.showHighScore && (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <div className={`text-lg font-bold ${scoreDisplay.isNewHighScore ? 'text-yellow-300 animate-pulse' : 'text-yellow-400'}`}>
                    {scoreDisplay.high.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {scoreDisplay.isNewHighScore ? '🎉 New High Score!' : 'High Score'}
                  </div>
                </div>
              )}
              
              {menuType === 'levelComplete' && (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <div className="text-green-400 font-semibold">
                    🎉 Level {scoreDisplay.level} Complete!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game Instructions for Start Menu */}
          {menuType === 'start' && (
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700/50">
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-2">
                  🎯 <strong>Objective:</strong> {instructions.objective}
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>🎮 {instructions.movement}</div>
                  <div>🚫 {instructions.avoid}</div>
                  <div>⏸️ {instructions.pause}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {getMainButton()}
            {getSecondaryButtons()}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 p-6 rounded-lg border border-red-400/30 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-400 mb-4 text-center">
              ⚠️ Confirm Exit
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              Are you sure you want to exit to the main menu?
              {menuType === 'pause' && (
                <span className="block text-yellow-400 text-sm mt-2">
                  Your current game progress will be lost.
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmExit}
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
    </>
  );
};

export default GameMenu;
