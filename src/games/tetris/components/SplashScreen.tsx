import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  message?: string;
  duration?: number;
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  message = 'Loading...',
  duration = 400,
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('SplashScreen: Starting animation');
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let animationFrameId: number;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(currentProgress);
      
      if (currentProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete, start fade out
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
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4 font-mono">TETRIS</h1>
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
      <div className="w-72 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-gray-400 text-sm">
        {Math.round(progress)}% loaded
      </div>
    </div>
  );
};

export default SplashScreen;
