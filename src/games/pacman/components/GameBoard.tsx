import React, { useRef, useEffect, useState } from 'react';
import { PacmanGameState } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRID_SIZE, 
  COLORS, 
  DIRECTIONS,
  MAZE_WIDTH,
  MAZE_HEIGHT
} from '../constants';
import { pixelToGrid, gridToPixel } from '../utils/collision';
import { ParticleSystem } from '../utils/particles';

interface GameBoardProps {
  gameState: PacmanGameState;
  showDebug?: boolean;
  onParticleEvent?: (type: string, x: number, y: number, data?: any) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, showDebug = false, onParticleEvent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef(new ParticleSystem());
  const lastUpdateRef = useRef(Date.now());
  
  // Track previous state to detect events
  const [prevScore, setPrevScore] = useState(gameState.score);
  const [prevDotsRemaining, setPrevDotsRemaining] = useState(gameState.dotsRemaining);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Update particles
    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    lastUpdateRef.current = now;
    particleSystemRef.current.update(deltaTime);
    
    // Detect particle events
    if (gameState.score > prevScore) {
      const scoreDiff = gameState.score - prevScore;
      const pacmanX = gameState.pacman.position.x + GRID_SIZE / 2;
      const pacmanY = gameState.pacman.position.y + GRID_SIZE / 2;
      
      if (scoreDiff === 10) { // Dot eaten
        particleSystemRef.current.addDotParticles(pacmanX, pacmanY);
      } else if (scoreDiff === 50) { // Power pellet eaten
        particleSystemRef.current.addPowerPelletParticles(pacmanX, pacmanY);
      } else if (scoreDiff >= 200) { // Ghost eaten
        particleSystemRef.current.addScoreParticle(pacmanX, pacmanY, scoreDiff);
      }
    }
    
    setPrevScore(gameState.score);
    setPrevDotsRemaining(gameState.dotsRemaining);
    
    // Clear canvas
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw maze
    drawMaze(ctx, gameState.maze);
    
    // Draw debug targets if enabled
    if (showDebug) {
      drawDebugTargets(ctx, gameState.ghosts);
    }
    
    // Draw ghosts (draw before Pac-Man so Pac-Man appears on top)
    gameState.ghosts.forEach(ghost => drawGhost(ctx, ghost));
    
    // Draw Pac-Man
    drawPacman(ctx, gameState.pacman);
    
    // Draw particles
    particleSystemRef.current.render(ctx);
    
  }, [gameState, showDebug, prevScore, prevDotsRemaining]);
  
  const drawMaze = (ctx: CanvasRenderingContext2D, maze: number[][]) => {
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const cellType = maze[y][x];
        const pixelX = x * GRID_SIZE;
        const pixelY = y * GRID_SIZE;
        
        switch (cellType) {
          case 1: // Wall
            drawWall(ctx, pixelX, pixelY);
            break;
          case 2: // Dot
            drawDot(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
            break;
          case 3: // Power pellet
            drawPowerPellet(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
            break;
          // case 0: empty space, case 4: ghost house - no drawing needed
        }
      }
    }
  };
  
  const drawWall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = COLORS.WALL;
    ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
    
    // Add some visual detail to walls
    ctx.strokeStyle = '#4444FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
  };
  
  const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = COLORS.DOT;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawPowerPellet = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = COLORS.POWER_PELLET;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Add pulsing effect
    const time = Date.now() / 200;
    const alpha = 0.5 + 0.5 * Math.sin(time);
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawPacman = (ctx: CanvasRenderingContext2D, pacman: any) => {
    const centerX = pacman.position.x + GRID_SIZE / 2;
    const centerY = pacman.position.y + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;
    
    ctx.fillStyle = COLORS.PACMAN;
    ctx.beginPath();
    
    if (pacman.mouthOpen) {
      // Draw Pac-Man with mouth open
      let startAngle = 0;
      let endAngle = Math.PI * 2;
      
      // Adjust mouth direction based on movement
      switch (pacman.direction) {
        case 'RIGHT':
          startAngle = Math.PI * 0.2;
          endAngle = Math.PI * 1.8;
          break;
        case 'LEFT':
          startAngle = Math.PI * 1.2;
          endAngle = Math.PI * 0.8;
          break;
        case 'UP':
          startAngle = Math.PI * 1.7;
          endAngle = Math.PI * 1.3;
          break;
        case 'DOWN':
          startAngle = Math.PI * 0.7;
          endAngle = Math.PI * 0.3;
          break;
      }
      
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
    } else {
      // Draw closed circle
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    }
    
    ctx.fill();
    
    // Add eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawGhost = (ctx: CanvasRenderingContext2D, ghost: any) => {
    const centerX = ghost.position.x + GRID_SIZE / 2;
    const centerY = ghost.position.y + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;
    
    // Choose color based on mode
    let color = ghost.color;
    if (ghost.mode === 'scared') {
      // Flash between blue and white when scared timer is low
      if (ghost.scaredTimer < 2000 && Math.floor(Date.now() / 200) % 2) {
        color = COLORS.SCARED_GHOST_FLASH;
      } else {
        color = COLORS.SCARED_GHOST;
      }
    } else if (ghost.mode === 'eaten') {
      // Just draw eyes for eaten ghosts
      drawGhostEyes(ctx, centerX, centerY);
      return;
    }
    
    ctx.fillStyle = color;
    
    // Draw ghost body (rounded top, wavy bottom)
    ctx.beginPath();
    ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);
    ctx.lineTo(centerX + radius, centerY + radius - 2);
    
    // Draw wavy bottom
    const waveWidth = radius / 3;
    for (let i = 0; i < 3; i++) {
      const waveX = centerX + radius - (i * waveWidth * 2);
      ctx.lineTo(waveX - waveWidth, centerY + radius - 2);
      ctx.lineTo(waveX - waveWidth * 2, centerY + radius - 6);
    }
    
    ctx.lineTo(centerX - radius, centerY + radius - 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw eyes
    drawGhostEyes(ctx, centerX, centerY);
    
    // Draw direction indicator for scared ghosts
    if (ghost.mode === 'scared') {
      drawScaredMouth(ctx, centerX, centerY);
    }
  };
  
  const drawGhostEyes = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.fillStyle = '#FFFFFF';
    // Left eye
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 4, 1, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawScaredMouth = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Draw zigzag mouth
    const mouthY = centerY + 2;
    ctx.moveTo(centerX - 6, mouthY);
    ctx.lineTo(centerX - 3, mouthY - 3);
    ctx.lineTo(centerX, mouthY);
    ctx.lineTo(centerX + 3, mouthY - 3);
    ctx.lineTo(centerX + 6, mouthY);
    
    ctx.stroke();
  };
  
  const drawDebugTargets = (ctx: CanvasRenderingContext2D, ghosts: any[]) => {
    ghosts.forEach(ghost => {
      if (ghost.target && ghost.mode !== 'eaten') {
        const targetX = gridToPixel(ghost.target.x) + GRID_SIZE / 2;
        const targetY = gridToPixel(ghost.target.y) + GRID_SIZE / 2;
        
        // Draw target indicator
        ctx.strokeStyle = ghost.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw line from ghost to target
        const ghostX = ghost.position.x + GRID_SIZE / 2;
        const ghostY = ghost.position.y + GRID_SIZE / 2;
        
        ctx.strokeStyle = ghost.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ghostX, ghostY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  };
  
  return (
    <div className="flex justify-center items-center bg-black p-4 rounded-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-blue-500 rounded"
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default GameBoard;
