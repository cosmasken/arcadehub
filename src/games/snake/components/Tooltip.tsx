import React, { useEffect, useState } from 'react';

interface TooltipProps {
  message: string;
  onComplete: () => void;
  duration?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  message, 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Small delay before calling onComplete for smooth fade out
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 300);
      
      return () => clearTimeout(completeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default Tooltip;
