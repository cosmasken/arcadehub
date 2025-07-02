import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]} ${className}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 -translate-x-1/2 ${
            position === 'top' ? 'bottom-[-4px] left-1/2' : ''
          } ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''} ${
            position === 'bottom' ? 'top-[-4px] left-1/2' : ''
          } ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
