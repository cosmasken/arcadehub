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
      console.log('SplashScreen: Cleaning up');
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Snake Game</h1>
        <p className="text-gray-300">{message}</p>
      </div>
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
