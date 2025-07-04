import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors',
        'bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-gray-600',
        'backdrop-blur-sm',
        className
      )}
    >
      <ArrowLeft size={16} />
      <span>Back to Games</span>
    </button>
  );
};

export default BackButton;
