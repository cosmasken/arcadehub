import React, { useEffect, useState } from 'react';
import { useGame } from '../context';
import { useGameState } from '../context/GameStateContext';
import { LEVELS } from '../constants';

const StatsPanel: React.FC = () => {
  const { state } = useGame();
  const { state: gameState } = useGameState();
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Get current level config or fallback to first level
  const currentLevel = LEVELS[state.level - 1] || LEVELS[0];
  const nextLevel = LEVELS[state.level] || null;
  
  // Calculate progress to next level (0-100)
  const progress = nextLevel 
    ? Math.min(100, Math.round((state.linesCleared / nextLevel.linesNeeded) * 100))
    : 100;

  // Show level up animation when level changes
  useEffect(() => {
    if (state.level > 1) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.level]);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md text-black">
      {/* Level Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold text-gray-800">Level {state.level}</h3>
          <span className="text-sm text-gray-500">
            {state.linesCleared}{nextLevel ? `/${nextLevel.linesNeeded}` : ''} apples
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Level Description */}
        <p className="text-xs text-gray-600 italic">
          {currentLevel.description}
        </p>
        
        {/* Level Up Indicator */}
        {showLevelUp && (
          <div className="mt-2 text-center">
            <span className="inline-block px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded-full animate-bounce">
              Level Up! 🎉
            </span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Score:</span>
          <span className="font-semibold">{state.score}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">High Score:</span>
          <span className="font-semibold">{state.highScore}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Coins:</span>
          <div className="flex items-center">
            <span className="font-semibold mr-1">{state.coins || 0}</span>
            <span className="text-yellow-500">🪙</span>
          </div>
        </div>
        
        {currentLevel.timeLimit && (
          <div className="flex justify-between">
            <span className="text-gray-600">Time Left:</span>
            <span className="font-semibold">{/* Time remaining would go here */}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
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
