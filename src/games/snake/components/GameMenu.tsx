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
  level = 1,
  onStart,
  onRestart,
  onSave,
  onQuit,
}) => {
  if (!type) return null;

  const title = type === 'start' ? 'SNAKE' : 
                type === 'pause' ? 'PAUSED' : 'GAME OVER';

  // Determine which buttons to show based on menu type
  const getButtons = () => {
    switch (type) {
      case 'start':
        return (
          <>
            <button
              onClick={onStart}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors mb-2"
            >
              Start Game
            </button>
            <button
              onClick={onQuit}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              Quit
            </button>
          </>
        );
      case 'pause':
        return (
          <>
            <button
              onClick={onStart}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors mb-2"
            >
              Resume
            </button>
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors mb-2"
            >
              Restart
            </button>
            <button
              onClick={onQuit}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              Quit to Menu
            </button>
          </>
        );
      case 'gameOver':
        return (
          <>
            <button
              onClick={onRestart}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors mb-2"
            >
              Play Again
            </button>
            <button
              onClick={onQuit}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              Main Menu
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-xl border border-cyan-400 w-64">
        <h2 className="text-xl font-bold text-center mb-3 text-cyan-400 uppercase tracking-wider">
          {title}
        </h2>
        
        {(type === 'gameOver' || type === 'pause') && (
          <div className="mb-4 text-center text-xs space-y-1">
            <p className="text-gray-300">Score: <span className="text-yellow-400 font-medium">{score}</span></p>
            <p className="text-gray-300">High Score: <span className="text-yellow-400 font-medium">{highScore}</span></p>
            <p className="text-gray-300">Level: <span className="text-yellow-400 font-medium">{level}</span></p>
          </div>
        )}
        
        <div className="space-y-2">
          {getButtons()}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
