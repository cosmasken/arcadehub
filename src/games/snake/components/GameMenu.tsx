import React from 'react';
import { GameState } from '../types';

interface GameMenuProps {
  type: 'start' | 'pause' | 'gameOver' | null;
  score: number;
  highScore: number;
  level?: number;
  onStart: () => void;
  onRestart: () => void;
  onSave: () => void;
  onQuit: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  type,
  score,
  highScore,
  level = 1, // Default level if not provided
  onStart,
  onRestart,
  onSave,
  onQuit,
}) => {
  if (!type) return null;

  const title = type === 'start' ? 'Snake Game' : 
                type === 'pause' ? 'Game Paused' : 'Game Over';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl border border-cyan-400 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">{title}</h2>
        
        {(type === 'gameOver' || type === 'pause') && (
          <div className="mb-6 text-center">
            <p className="text-white text-lg">Score: <span className="text-yellow-400">{score}</span></p>
            <p className="text-white text-lg">High Score: <span className="text-yellow-400">{highScore}</span></p>
            <p className="text-white text-lg">Level: <span className="text-yellow-400">{level}</span></p>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          {type === 'start' && (
            <>
              <button
                onClick={onStart}
                className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Game
              </button>
              <button
                onClick={onQuit}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Quit
              </button>
            </>
          )}

          {type === 'pause' && (
            <>
              <button
                onClick={onStart}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Resume Game
              </button>
              <button
                onClick={onSave}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Save Game
              </button>
              <button
                onClick={onRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Restart
              </button>
              <button
                onClick={onQuit}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Quit to Menu
              </button>
            </>
          )}

          {type === 'gameOver' && (
            <>
              <button
                onClick={onRestart}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={onSave}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Save Score
              </button>
              <button
                onClick={onQuit}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
              >
                Main Menu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
