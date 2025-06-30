import React from 'react';
import { useGame } from '../context';

const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();
  
  if (!state.gameOver) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Game Over</h2>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Score:</span>
            <span className="font-mono">{state.stats.score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Level:</span>
            <span className="font-mono">{state.stats.level}</span>
          </div>
          <div className="flex justify-between">
            <span>Lines:</span>
            <span className="font-mono">{state.stats.linesCleared}</span>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Quit
          </button>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
