import React from 'react';
import { PacmanGameState } from '../types';
import { Heart, Star, Trophy, Zap, Eye, Target } from 'lucide-react';

interface GameUIProps {
  gameState: PacmanGameState;
  showDebug?: boolean;
  onToggleDebug?: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, showDebug = false, onToggleDebug }) => {
  const { score, highScore, lives, level, dotsRemaining, powerPelletActive, currentGhostMode } = gameState;
  
  return (
    <div className="w-full max-w-md mx-auto mb-4">
      {/* Top Row - Score and High Score */}
      <div className="flex justify-between items-center mb-3 px-4 py-2 bg-gray-900/80 rounded-lg border border-yellow-500/30">
        <div className="text-center">
          <div className="text-yellow-400 text-xs font-mono uppercase tracking-wider">Score</div>
          <div className="text-white text-lg font-bold font-mono">{score.toLocaleString()}</div>
        </div>
        
        <div className="text-center">
          <div className="text-yellow-400 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3" />
            High Score
          </div>
          <div className="text-white text-lg font-bold font-mono">{highScore.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Middle Row - Lives and Level */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-red-500/30">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-mono uppercase">Lives</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.max(0, lives) }, (_, i) => (
              <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-blue-500/30">
          <Star className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-xs font-mono uppercase">Level</span>
          <span className="text-white text-sm font-bold font-mono">{level}</span>
        </div>
      </div>
      
      {/* Bottom Row - Game Status */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-green-500/30">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-green-400 text-xs font-mono uppercase">Dots Left</span>
          <span className="text-white text-sm font-bold font-mono">{dotsRemaining}</span>
        </div>
        
        {powerPelletActive && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-purple-500/30 animate-pulse">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-xs font-mono uppercase">Power Mode</span>
          </div>
        )}
      </div>
      
      {/* Ghost Mode and Debug Controls */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-cyan-500/30">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-xs font-mono uppercase">Ghost Mode</span>
          <span className={`text-sm font-bold font-mono ${
            currentGhostMode === 'chase' ? 'text-red-400' : 'text-blue-400'
          }`}>
            {currentGhostMode.toUpperCase()}
          </span>
        </div>
        
        {onToggleDebug && (
          <button
            onClick={onToggleDebug}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showDebug 
                ? 'bg-orange-900/80 border-orange-500/30 text-orange-400' 
                : 'bg-gray-900/80 border-gray-500/30 text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Debug</span>
          </button>
        )}
      </div>
      
      {/* Game State Indicator */}
      {gameState.gameState !== 'playing' && (
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-gray-900/90 rounded-lg border border-cyan-500/50">
            <span className="text-cyan-400 text-sm font-mono uppercase tracking-wider">
              {gameState.gameState === 'paused' && 'Paused'}
              {gameState.gameState === 'game_over' && 'Game Over'}
              {gameState.gameState === 'level_complete' && 'Level Complete!'}
              {gameState.gameState === 'menu' && 'Ready to Play'}
            </span>
          </div>
        </div>
      )}
      
      {/* Debug Info */}
      {showDebug && gameState.gameState === 'playing' && (
        <div className="mt-3 p-3 bg-gray-900/90 rounded-lg border border-orange-500/30">
          <div className="text-orange-400 text-xs font-mono uppercase mb-2">Debug Info</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {gameState.ghosts.map(ghost => (
              <div key={ghost.id} className="text-gray-300">
                <span style={{ color: ghost.color }}>{ghost.id}</span>: {ghost.mode}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
