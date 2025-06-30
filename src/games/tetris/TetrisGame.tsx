import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './context';
import { COLS, ROWS, COLORS, SHAPES, LEVELS } from './constants';
import { Position } from './types';
import { drawBlock, drawGhostBlock } from './utils/draw';
import { 
  Stats, 
  HoldPiece, 
  NextPieces, 
  Controls, 
  Shop, 
  Achievements, 
  GameOverModal,
  Board 
} from './components';

// Game board component



export const TetrisGame: React.FC = () => {
  // Prevent page scrolling when game is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-auto">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Games
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Stats />
            <HoldPiece />
            <NextPieces />
            <Controls />
          </div>
          
          {/* Main game area */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <Board />
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Shop />
            <Achievements />
          </div>
        </div>
        
        <GameOverModal />
      </div>
    </div>
  );
};

export default TetrisGame;
