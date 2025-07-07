import { SHAPES } from '../constants';

// Enhanced SRS (Super Rotation System) implementation
// Standard rotation states: 0 = spawn, 1 = right, 2 = 2, 3 = left

// Wall kick data for JLSTZ pieces (standard pieces)
const WALL_KICK_DATA_JLSTZ = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
};

// Wall kick data for I piece (special case)
const WALL_KICK_DATA_I = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};

// O piece doesn't rotate, so no wall kick data needed

/**
 * Rotates a matrix 90 degrees clockwise
 */
export const rotateMatrix = (matrix: number[][], clockwise: boolean = true): number[][] => {
  if (!matrix.length || !matrix[0]?.length) return matrix;
  
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  if (clockwise) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = matrix[y][x];
      }
    }
  } else {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[cols - 1 - x][y] = matrix[y][x];
      }
    }
  }
  
  return rotated;
};

/**
 * Gets the shape for a specific piece type and rotation state
 */
export const getShapeForRotation = (pieceType: number, rotation: number): number[][] => {
  if (pieceType === 0 || pieceType >= SHAPES.length) return [];
  
  let shape = SHAPES[pieceType];
  const normalizedRotation = ((rotation % 4) + 4) % 4; // Ensure positive rotation
  
  // Apply rotations
  for (let i = 0; i < normalizedRotation; i++) {
    shape = rotateMatrix(shape, true);
  }
  
  return shape;
};

/**
 * Gets wall kick tests for a specific piece type and rotation transition
 */
export const getWallKickTests = (
  pieceType: number, 
  fromRotation: number, 
  toRotation: number
): [number, number][] => {
  // O piece doesn't need wall kicks
  if (pieceType === 4) return [[0, 0]];
  
  const from = ((fromRotation % 4) + 4) % 4;
  const to = ((toRotation % 4) + 4) % 4;
  const key = `${from}->${to}` as keyof typeof WALL_KICK_DATA_JLSTZ;
  
  // I piece uses special wall kick data
  if (pieceType === 1) {
    return WALL_KICK_DATA_I[key] || [[0, 0]];
  }
  
  // All other pieces use standard wall kick data
  return WALL_KICK_DATA_JLSTZ[key] || [[0, 0]];
};

/**
 * Validates if a piece can be placed at a specific position
 */
export const isValidPosition = (
  board: number[][],
  shape: number[][],
  position: { x: number; y: number }
): boolean => {
  if (!shape.length || !shape[0]?.length) return false;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 0) continue; // Skip empty cells
      
      const boardX = position.x + x;
      const boardY = position.y + y;
      
      // Check horizontal boundaries
      if (boardX < 0 || boardX >= board[0]?.length) return false;
      
      // Check bottom boundary
      if (boardY >= board.length) return false;
      
      // Allow pieces to spawn above the visible board
      if (boardY < 0) continue;
      
      // Check for collision with existing pieces
      if (board[boardY]?.[boardX] !== 0) return false;
    }
  }
  
  return true;
};

/**
 * Attempts to rotate a piece using SRS wall kick system
 */
export const attemptRotation = (
  board: number[][],
  currentShape: number[][],
  position: { x: number; y: number },
  pieceType: number,
  currentRotation: number,
  clockwise: boolean = true
): {
  success: boolean;
  newShape: number[][];
  newPosition: { x: number; y: number };
  newRotation: number;
} => {
  const targetRotation = clockwise 
    ? (currentRotation + 1) % 4 
    : (currentRotation + 3) % 4;
  
  const newShape = getShapeForRotation(pieceType, targetRotation);
  const wallKickTests = getWallKickTests(pieceType, currentRotation, targetRotation);
  
  // Try each wall kick test
  for (const [dx, dy] of wallKickTests) {
    const testPosition = {
      x: position.x + dx,
      y: position.y + dy
    };
    
    if (isValidPosition(board, newShape, testPosition)) {
      return {
        success: true,
        newShape,
        newPosition: testPosition,
        newRotation: targetRotation
      };
    }
  }
  
  // No valid rotation found
  return {
    success: false,
    newShape: currentShape,
    newPosition: position,
    newRotation: currentRotation
  };
};

/**
 * Gets the spawn position for a new piece
 */
export const getSpawnPosition = (pieceType: number): { x: number; y: number } => {
  const boardWidth = 10; // Standard Tetris board width
  
  // I and O pieces spawn differently
  if (pieceType === 1) { // I piece
    return { x: Math.floor(boardWidth / 2) - 2, y: -1 };
  } else if (pieceType === 4) { // O piece
    return { x: Math.floor(boardWidth / 2) - 1, y: -1 };
  } else {
    // Standard spawn position for other pieces
    return { x: Math.floor(boardWidth / 2) - 1, y: -1 };
  }
};

/**
 * Calculates the ghost piece position (where the piece would land)
 */
export const getGhostPosition = (
  board: number[][],
  shape: number[][],
  position: { x: number; y: number }
): { x: number; y: number } => {
  let ghostY = position.y;
  
  // Keep moving down until we hit something
  while (isValidPosition(board, shape, { x: position.x, y: ghostY + 1 })) {
    ghostY++;
  }
  
  return { x: position.x, y: ghostY };
};

/**
 * Gets the bounding box of a shape (useful for centering and positioning)
 */
export const getShapeBounds = (shape: number[][]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  return {
    minX: minX === Infinity ? 0 : minX,
    maxX: maxX === -Infinity ? 0 : maxX,
    minY: minY === Infinity ? 0 : minY,
    maxY: maxY === -Infinity ? 0 : maxY,
    width: maxX === -Infinity ? 0 : maxX - minX + 1,
    height: maxY === -Infinity ? 0 : maxY - minY + 1
  };
};
