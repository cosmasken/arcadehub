import { Position, CollisionResult } from '../types';
import { MAZE_WIDTH, MAZE_HEIGHT, GRID_SIZE } from '../constants';

export const isWall = (maze: number[][], x: number, y: number): boolean => {
  if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
    return true;
  }
  return maze[y][x] === 1;
};

export const canMoveTo = (maze: number[][], x: number, y: number): boolean => {
  if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
    return false;
  }
  return maze[y][x] !== 1; // Not a wall
};

export const getCellType = (maze: number[][], x: number, y: number): number => {
  if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
    return 1; // Treat out of bounds as wall
  }
  return maze[y][x];
};

export const gridToPixel = (gridPos: number): number => {
  return gridPos * GRID_SIZE;
};

export const pixelToGrid = (pixelPos: number): number => {
  return Math.floor(pixelPos / GRID_SIZE);
};

export const isAtGridCenter = (pixelPos: number): boolean => {
  return pixelPos % GRID_SIZE === 0;
};

export const snapToGrid = (pixelPos: number): number => {
  return Math.round(pixelPos / GRID_SIZE) * GRID_SIZE;
};

export const checkCollision = (
  maze: number[][], 
  position: Position, 
  targetX: number, 
  targetY: number
): CollisionResult => {
  const gridX = pixelToGrid(targetX);
  const gridY = pixelToGrid(targetY);
  
  // Check bounds
  if (gridX < 0 || gridX >= MAZE_WIDTH || gridY < 0 || gridY >= MAZE_HEIGHT) {
    return { collision: true, type: 'wall' };
  }
  
  const cellType = maze[gridY][gridX];
  
  switch (cellType) {
    case 1: // Wall
      return { collision: true, type: 'wall' };
    case 2: // Dot
      return { collision: false, type: 'dot', position: { x: gridX, y: gridY } };
    case 3: // Power pellet
      return { collision: false, type: 'power_pellet', position: { x: gridX, y: gridY } };
    default: // Empty space
      return { collision: false };
  }
};

export const getDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getManhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export const isEntityCollision = (pos1: Position, pos2: Position, threshold: number = GRID_SIZE / 2): boolean => {
  return getDistance(pos1, pos2) < threshold;
};

// Handle tunnel wrapping (left-right edges of maze)
export const handleTunnelWrap = (position: Position): Position => {
  let { x, y } = position;
  
  // Left tunnel exit
  if (x < 0) {
    x = MAZE_WIDTH * GRID_SIZE - GRID_SIZE;
  }
  // Right tunnel exit
  else if (x >= MAZE_WIDTH * GRID_SIZE) {
    x = 0;
  }
  
  return { x, y };
};

export const getValidDirections = (maze: number[][], position: Position): string[] => {
  const gridX = pixelToGrid(position.x);
  const gridY = pixelToGrid(position.y);
  const validDirections: string[] = [];
  
  // Check all four directions
  if (canMoveTo(maze, gridX, gridY - 1)) validDirections.push('UP');
  if (canMoveTo(maze, gridX, gridY + 1)) validDirections.push('DOWN');
  if (canMoveTo(maze, gridX - 1, gridY)) validDirections.push('LEFT');
  if (canMoveTo(maze, gridX + 1, gridY)) validDirections.push('RIGHT');
  
  return validDirections;
};
