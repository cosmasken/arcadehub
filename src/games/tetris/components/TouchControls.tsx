import React from 'react';
import { GameAction } from '../types';

interface TouchControlsProps {
  dispatch: React.Dispatch<GameAction>;
  visible: boolean;
}

/**
 * TouchControls component provides on-screen buttons for mobile gameplay
 */
export const TouchControls: React.FC<TouchControlsProps> = ({ dispatch, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex flex-col items-center z-20 touch-none">
      {/* Top row - Rotate */}
      <div className="mb-4 w-full flex justify-center">
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'ROTATE' })}
          aria-label="Rotate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Middle row - Left, Hard Drop, Right */}
      <div className="flex justify-between w-full max-w-md mb-4">
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'MOVE_LEFT' })}
          aria-label="Move Left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'HARD_DROP' })}
          aria-label="Hard Drop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'MOVE_RIGHT' })}
          aria-label="Move Right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Bottom row - Soft Drop and Hold */}
      <div className="flex justify-between w-full max-w-md">
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'SOFT_DROP' })}
          aria-label="Soft Drop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          className="w-16 h-16 rounded-full bg-gray-800/70 backdrop-blur flex items-center justify-center text-white border-2 border-gray-700 active:bg-gray-700"
          onClick={() => dispatch({ type: 'HOLD' })}
          aria-label="Hold Piece"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </button>
      </div>
      
      {/* Help text */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Tap buttons or use swipe gestures to control</p>
        <p>Double-tap screen for hard drop</p>
      </div>
    </div>
  );
};
