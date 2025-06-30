import React from 'react';
import { useGame } from '../hooks/useGame';

const StatsPanel: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Stats</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Score:</span>
          <span className="font-semibold">{state.score}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">High Score:</span>
          <span className="font-semibold">{state.highScore}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Level:</span>
          <span className="font-semibold">{state.level}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Lines:</span>
          <span className="font-semibold">{state.linesCleared}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Coins:</span>
          <div className="flex items-center">
            <span className="font-semibold mr-1">{state.coins}</span>
            <span className="text-yellow-500">🪙</span>
          </div>
        </div>
      </div>
      
      {state.gameOver && (
        <div className="mt-4 p-3 bg-red-50 rounded-md text-center">
          <p className="text-red-600 font-medium">Game Over!</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      
      {!state.isStarted && !state.gameOver && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">Press any arrow key to start</p>
          <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
            <div></div>
            <button className="bg-gray-200 p-2 rounded">⬆️</button>
            <div></div>
            <button className="bg-gray-200 p-2 rounded">⬅️</button>
            <button className="bg-gray-200 p-2 rounded">⬇️</button>
            <button className="bg-gray-200 p-2 rounded">➡️</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
