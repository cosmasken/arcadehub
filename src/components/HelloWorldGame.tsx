import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import HoneyClicker from '../games/HoneyClicker';

interface HelloWorldGameProps {
  gameName: string;
}

export const HelloWorldGame = ({ gameName }: HelloWorldGameProps) => {
  // Check if the selected game is Honey Clicker
  // if (gameName === 'Honey Clicker' || gameName.toLowerCase().includes('honey')) {
  //   return <HoneyClicker gameName={gameName} />;
  // }

  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        setScore(prev => prev + Math.floor(Math.random() * 10));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const step = 5;
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        switch (e.key) {
          case 'ArrowUp':
            newY = Math.max(10, prev.y - step);
            break;
          case 'ArrowDown':
            newY = Math.min(80, prev.y + step);
            break;
          case 'ArrowLeft':
            newX = Math.max(10, prev.x - step);
            break;
          case 'ArrowRight':
            newX = Math.min(80, prev.x + step);
            break;
        }
        
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setGameTime(0);
    setPlayerPosition({ x: 50, y: 50 });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="bg-black/30 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h3 className="text-white font-semibold">{gameName}</h3>
          <div className="text-cyan-400">Score: {score}</div>
          <div className="text-yellow-400">Time: {formatTime(gameTime)}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pauseGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-cyan-400 rounded-full shadow-lg transition-all duration-100 border-2 border-white"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
          }}
        >
          <div className="absolute inset-1 bg-cyan-300 rounded-full"></div>
        </div>

        {/* Game Instructions */}
        {!isPlaying && gameTime === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
              <h3 className="text-white text-2xl font-bold mb-4">Welcome to {gameName}!</h3>
              <p className="text-white/80 mb-6">
                This is a sample game that launches for every game selection.
              </p>
              <div className="text-white/70 space-y-2 mb-6">
                <p>• Use arrow keys to move the cyan ball</p>
                <p>• Your score increases automatically while playing</p>
                <p>• Click play to start the adventure!</p>
              </div>
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start Game</span>
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {!isPlaying && gameTime > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <h3 className="text-white text-xl font-bold mb-4">Game Paused</h3>
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
