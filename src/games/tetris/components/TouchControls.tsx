import React, { useCallback } from 'react';
import { GameAction } from '../types';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, Square, Pause } from 'lucide-react';

interface TouchControlsProps {
  dispatch: React.Dispatch<GameAction>;
  visible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ dispatch, visible }) => {
  const handleAction = useCallback((action: GameAction) => {
    dispatch(action);
  }, [dispatch]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="max-w-sm mx-auto">
        {/* Top Row - Rotate and Hold */}
        <div className="flex justify-between mb-3">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleAction({ type: 'ROTATE' });
            }}
            className="bg-blue-600/90 hover:bg-blue-700/90 active:bg-blue-800/90 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm border border-blue-400/30 transition-all duration-150 transform active:scale-95"
            aria-label="Rotate"
          >
            <RotateCw className="w-6 h-6" />
          </button>
          
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleAction({ type: 'HOLD' });
            }}
            className="bg-purple-600/90 hover:bg-purple-700/90 active:bg-purple-800/90 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm border border-purple-400/30 transition-all duration-150 transform active:scale-95"
            aria-label="Hold Piece"
          >
            <Square className="w-6 h-6" />
          </button>
        </div>

        {/* Main Control Grid */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30 shadow-2xl">
          {/* Movement Controls */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Top row - empty, up (soft drop), empty */}
            <div></div>
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleAction({ type: 'SOFT_DROP' });
              }}
              className="bg-green-600/90 hover:bg-green-700/90 active:bg-green-800/90 text-white p-4 rounded-lg shadow-lg border border-green-400/30 transition-all duration-150 transform active:scale-95 flex items-center justify-center"
              aria-label="Soft Drop"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <div></div>

            {/* Middle row - left, hard drop, right */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleAction({ type: 'MOVE_LEFT' });
              }}
              className="bg-cyan-600/90 hover:bg-cyan-700/90 active:bg-cyan-800/90 text-white p-4 rounded-lg shadow-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95 flex items-center justify-center"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleAction({ type: 'HARD_DROP' });
              }}
              className="bg-red-600/90 hover:bg-red-700/90 active:bg-red-800/90 text-white p-4 rounded-lg shadow-lg border border-red-400/30 transition-all duration-150 transform active:scale-95 flex items-center justify-center font-bold text-sm"
              aria-label="Hard Drop"
            >
              DROP
            </button>
            
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleAction({ type: 'MOVE_RIGHT' });
              }}
              className="bg-cyan-600/90 hover:bg-cyan-700/90 active:bg-cyan-800/90 text-white p-4 rounded-lg shadow-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95 flex items-center justify-center"
              aria-label="Move Right"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Pause Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleAction({ type: 'PAUSE' });
            }}
            className="w-full bg-yellow-600/90 hover:bg-yellow-700/90 active:bg-yellow-800/90 text-white p-3 rounded-lg shadow-lg border border-yellow-400/30 transition-all duration-150 transform active:scale-95 flex items-center justify-center gap-2"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5" />
            <span className="font-medium">PAUSE</span>
          </button>
        </div>

        {/* Control Labels */}
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400 bg-gray-900/60 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
            Tap controls to play • Swipe for quick moves
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouchControls;
