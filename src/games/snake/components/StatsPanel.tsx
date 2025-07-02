import React from 'react';
import { useGame } from '../hooks/useGame';
import { useGameState } from '../context/GameStateContext';

const StatsPanel: React.FC = () => {
  const { state } = useGame();
  const { state: gameState } = useGameState();
  
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
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2 text-sm">Controls</p>
        <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
          <div></div>
          <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
            {gameState.settings.useWASD ? 'W' : '↑'}
          </div>
          <div></div>
          <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
            {gameState.settings.useWASD ? 'A' : '←'}
          </div>
          <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
            {gameState.settings.useWASD ? 'S' : '↓'}
          </div>
          <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
            {gameState.settings.useWASD ? 'D' : '→'}
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default StatsPanel;
