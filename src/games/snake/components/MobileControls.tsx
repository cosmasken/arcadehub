import React from 'react';
import { Direction } from '../types';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  useWASD: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionChange, useWASD }) => {
  const handleDirectionClick = (direction: Direction) => {
    onDirectionChange(direction);
  };

  const getButtonLabel = (direction: Direction) => {
    if (useWASD) {
      switch (direction) {
        case 'UP': return 'W';
        case 'DOWN': return 'S';
        case 'LEFT': return 'A';
        case 'RIGHT': return 'D';
      }
    } else {
      switch (direction) {
        case 'UP': return '↑';
        case 'DOWN': return '↓';
        case 'LEFT': return '←';
        case 'RIGHT': return '→';
      }
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
      <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-cyan-400/20">
        <div className="text-center text-xs text-cyan-400 mb-2 font-medium">CONTROLS</div>
        <div className="grid grid-cols-3 gap-2 w-32">
          {/* Top row - UP button */}
          <div></div>
          <button
            onClick={() => handleDirectionClick('UP')}
            className="bg-cyan-900/70 hover:bg-cyan-800/90 active:bg-cyan-700 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95"
          >
            {getButtonLabel('UP')}
          </button>
          <div></div>
          
          {/* Middle row - LEFT and RIGHT buttons */}
          <button
            onClick={() => handleDirectionClick('LEFT')}
            className="bg-cyan-900/70 hover:bg-cyan-800/90 active:bg-cyan-700 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95"
          >
            {getButtonLabel('LEFT')}
          </button>
          <div></div>
          <button
            onClick={() => handleDirectionClick('RIGHT')}
            className="bg-cyan-900/70 hover:bg-cyan-800/90 active:bg-cyan-700 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95"
          >
            {getButtonLabel('RIGHT')}
          </button>
          
          {/* Bottom row - DOWN button */}
          <div></div>
          <button
            onClick={() => handleDirectionClick('DOWN')}
            className="bg-cyan-900/70 hover:bg-cyan-800/90 active:bg-cyan-700 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-all duration-150 transform active:scale-95"
          >
            {getButtonLabel('DOWN')}
          </button>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;
