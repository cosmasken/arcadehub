import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  controls: {
    moveLeft: string;
    moveRight: string;
    rotate: string;
    softDrop: string;
    hardDrop: string;
    hold: string;
    pause: string;
  };
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isOpen, onClose, controls }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-900 text-white p-6 overflow-y-auto z-50 border-l border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">How to Play</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close help"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Controls</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Move Left:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.moveLeft}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Move Right:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.moveRight}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Rotate:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.rotate}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Soft Drop:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.softDrop}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Hard Drop:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.hardDrop}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Hold Piece:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.hold}</kbd>
            </li>
            <li className="flex justify-between">
              <span>Pause:</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded">{controls.pause}</kbd>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Game Rules</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Complete lines to score points</li>
            <li>• Clear multiple lines at once for bonus points</li>
            <li>• The game speeds up as you level up</li>
            <li>• Use the Hold feature to save a piece for later</li>
            <li>• Try to clear as many lines as possible before the stack reaches the top!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpSidebar;
