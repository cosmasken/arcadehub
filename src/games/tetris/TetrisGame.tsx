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

// Prevent default touch behaviors that could cause scrolling
const preventDefault = (e: TouchEvent) => {
  if (e.touches.length > 1 || e.targetTouches.length > 1) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  return true;
};

export const TetrisGame: React.FC = () => {
  // Prevent page scrolling and touch events when game is mounted
  useEffect(() => {
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Prevent touch events that could cause scrolling
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('gesturestart', preventDefault);
    
    // Prevent keyboard scroll
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, false);
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('gesturestart', preventDefault);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-gray-900 flex flex-col"
      // style={{
      //   touchAction: 'none',
      //   WebkitOverflowScrolling: 'touch',
      //   overscrollBehavior: 'none'
      // }}
    >
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl flex flex-col overflow-hidden">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-3 sm:mb-4 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Games
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
          {/* Left sidebar */}
          <div className="md:col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 overflow-y-auto">
            <Stats />
            {/* <HoldPiece /> */}
            <NextPieces />
          </div>
          
          {/* Main game area */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <div className="relative w-full aspect-[10/20]">
              <Board />
              <Controls />
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="md:col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 overflow-y-auto">
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
