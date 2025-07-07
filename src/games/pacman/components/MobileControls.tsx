import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Direction } from '../types';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  isVisible: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionChange, isVisible }) => {
  if (!isVisible) return null;
  
  const handleDirectionPress = (direction: Direction) => {
    onDirectionChange(direction);
  };
  
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 md:hidden">
      <div className="relative w-32 h-32">
        {/* Up Button */}
        <button
          onTouchStart={() => handleDirectionPress('UP')}
          onClick={() => handleDirectionPress('UP')}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700/90 border border-yellow-500/50 rounded-lg flex items-center justify-center transition-colors active:bg-yellow-500/20"
        >
          <ChevronUp className="w-6 h-6 text-yellow-400" />
        </button>
        
        {/* Left Button */}
        <button
          onTouchStart={() => handleDirectionPress('LEFT')}
          onClick={() => handleDirectionPress('LEFT')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700/90 border border-yellow-500/50 rounded-lg flex items-center justify-center transition-colors active:bg-yellow-500/20"
        >
          <ChevronLeft className="w-6 h-6 text-yellow-400" />
        </button>
        
        {/* Right Button */}
        <button
          onTouchStart={() => handleDirectionPress('RIGHT')}
          onClick={() => handleDirectionPress('RIGHT')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700/90 border border-yellow-500/50 rounded-lg flex items-center justify-center transition-colors active:bg-yellow-500/20"
        >
          <ChevronRight className="w-6 h-6 text-yellow-400" />
        </button>
        
        {/* Down Button */}
        <button
          onTouchStart={() => handleDirectionPress('DOWN')}
          onClick={() => handleDirectionPress('DOWN')}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700/90 border border-yellow-500/50 rounded-lg flex items-center justify-center transition-colors active:bg-yellow-500/20"
        >
          <ChevronDown className="w-6 h-6 text-yellow-400" />
        </button>
        
        {/* Center Circle (decorative) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900/50 border border-yellow-500/30 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-yellow-400 text-xs font-mono">
          Tap to move Pac-Man
        </p>
      </div>
    </div>
  );
};

export default MobileControls;
