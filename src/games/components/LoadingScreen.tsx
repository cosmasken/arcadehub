
import React, { useEffect } from 'react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen = ({ onLoadComplete }: LoadingScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-200">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🍯</div>
        <h2 className="text-2xl font-bold text-amber-800 mb-2">Honey Clicker</h2>
        <p className="text-amber-600">Loading your sweet adventure...</p>
        <div className="mt-4 w-48 bg-amber-200 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );
};
