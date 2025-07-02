import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('SplashScreen: Starting animation');
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let animationFrameId: number;
    const TOTAL_DURATION = 3000; // 3 seconds total
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      
      setProgress(progress);
      
      if (progress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        console.log('SplashScreen: Animation complete, starting fade out');
        setIsVisible(false);
        // Small delay before calling onComplete for smooth fade out
        timeoutId = setTimeout(() => {
          console.log('SplashScreen: Calling onComplete');
          if (isMounted) {
            onComplete();
          }
        }, 300);
      }
    };
    
    // Start the animation on the next frame
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      console.log('SplashScreen: Cleaning up');
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-400 mb-6 animate-pulse">Snake Game</h1>
        <p className="text-white text-xl mb-8">Loading...</p>
        
        {/* Progress bar */}
        <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-gray-400 mt-4">{progress}%</p>
        
        <div className="mt-12 text-gray-500 text-sm">
          <p>Use arrow keys or WASD to control the snake</p>
          <p className="mt-2">Eat the food to grow and earn points</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
