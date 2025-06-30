import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { GRID_SIZE } from '../constants';

const GameBoard: React.FC = () => {
  const { state, changeDirection } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        changeDirection('UP');
        break;
      case 'ArrowDown':
        changeDirection('DOWN');
        break;
      case 'ArrowLeft':
        changeDirection('LEFT');
        break;
      case 'ArrowRight':
        changeDirection('RIGHT');
        break;
      default:
        break;
    }
  }, [changeDirection]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle window resize and canvas setup
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40; // Account for padding
        const size = Math.min(containerWidth, containerHeight, 800); // Max size of 800px
        const cellSize = Math.floor(size / GRID_SIZE);
        const width = cellSize * GRID_SIZE;
        const height = cellSize * GRID_SIZE;
        
        // Set canvas dimensions
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        // Update state for any components that need to know the dimensions
        setDimensions({ width, height });
      }
    };

    // Initial setup
    updateCanvasSize();
    
    // Handle window resize with debounce
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCanvasSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Draw food on the canvas
  const drawFood = (ctx: CanvasRenderingContext2D, food: { x: number; y: number }) => {
    if (!canvasRef.current) return;
    const cellSize = canvasRef.current.width / GRID_SIZE;
    
    // Draw food with a gradient
    const gradient = ctx.createRadialGradient(
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      0,
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      cellSize * 0.8
    );
    
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      cellSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.3) * cellSize,
      (food.y + 0.3) * cellSize,
      cellSize * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Game rendering loop
  const render = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw the grid with a dark theme and neon effect
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.05)';
    ctx.lineWidth = 0.5;
    
    // Draw a subtle gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, canvasRef.current.height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#0a1a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const cellSize = canvasRef.current.width / GRID_SIZE;
    
    // Draw grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasRef.current.height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasRef.current.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(
      (state.food.x + 0.5) * cellSize,
      (state.food.y + 0.5) * cellSize,
      cellSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    state.snake.forEach((segment, index) => {
      // Head is a different color
      if (index === 0) {
        ctx.fillStyle = '#2ed573'; // Head color
      } else {
        // Body color with slight gradient
        const intensity = 200 - Math.min(150, index * 2);
        ctx.fillStyle = `rgb(46, 213, 115, ${intensity / 255})`;
      }
      
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
      
      // Add eyes to the head
      if (index === 0) {
        const eyeSize = cellSize * 0.15;
        const eyeOffset = cellSize * 0.25;
        const pupilOffset = cellSize * 0.1;
        
        // Left eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(
          (segment.x + 0.3) * cellSize,
          (segment.y + 0.3) * cellSize,
          eyeSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(
          (segment.x + 0.7) * cellSize,
          (segment.y + 0.3) * cellSize,
          eyeSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(
          (segment.x + 0.3) * cellSize + pupilOffset * (state.direction === 'LEFT' ? -1 : state.direction === 'RIGHT' ? 1 : 0),
          (segment.y + 0.3) * cellSize + pupilOffset * (state.direction === 'UP' ? -1 : state.direction === 'DOWN' ? 1 : 0),
          eyeSize * 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
    
    // Draw the food
    drawFood(ctx, state.food);
    
    // Draw game over message if needed
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvasRef.current.width / 2, canvasRef.current.height / 2 - 30);
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${state.score}`, canvasRef.current.width / 2, canvasRef.current.height / 2 + 10);
      ctx.fillText('Press R to restart', canvasRef.current.width / 2, canvasRef.current.height / 2 + 40);
    }

    requestRef.current = requestAnimationFrame(render);
  }, [state]);

  // Set up the animation frame loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [render]);



  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4 overflow-hidden bg-black">
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="border-2 border-cyan-400 rounded-lg shadow-lg"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: 'transparent'
          }}
        />
      </div>
    </div>
  );

};

export default GameBoard;
