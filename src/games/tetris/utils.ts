import { COLS, ROWS, SHAPES } from './constants';
import { Position, Tetromino } from './types';

/**
 * Creates an empty game board with the specified dimensions
 * @returns A 2D array representing the empty game board
 */
export const createBoard = (): number[][] => {
  const board: number[][] = [];
  for (let i = 0; i < ROWS; i++) {
    board.push(Array(COLS).fill(0));
  }
  return board;
};

/**
 * Generates a random piece type index
 * @returns A number representing a random tetromino piece type
 */
export const getRandomPiece = (): number =>
  Math.floor(Math.random() * (SHAPES.length - 1)) + 1;

/**
 * Checks if a move is valid based on the current board state and piece position
 * @param board The current game board
 * @param shape The shape of the tetromino piece
 * @param position The position to check
 * @returns True if the move is valid, false otherwise
 */
export const isValidMove = (board: number[][], shape: number[][], position: Position): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // Skip empty cells in the shape
      if (shape[y][x] === 0) continue;

      // Calculate board position
      const boardX = position.x + x;
      const boardY = position.y + y;

      // Check boundaries
      if (boardX < 0 || boardX >= COLS) return false;  // Left/Right walls
      if (boardY >= ROWS) return false;                // Bottom

      // Check for collisions with existing pieces (only if within board bounds)
      if (boardY >= 0 && board[boardY][boardX] !== 0) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Rotates a matrix 90 degrees clockwise
 * @param matrix The matrix to rotate
 * @returns The rotated matrix
 */
export const rotateMatrix = (matrix: number[][]): number[][] => {
  if (!matrix.length) return matrix;

  // Make the matrix square if it's not
  const N = Math.max(matrix.length, Math.max(...matrix.map(row => row.length)));
  const paddedMatrix = matrix.map(row => [...row, ...Array(N - row.length).fill(0)]);
  while (paddedMatrix.length < N) {
    paddedMatrix.push(Array(N).fill(0));
  }

  // Create result matrix
  const result = Array(N).fill(0).map(() => Array(N).fill(0));

  // Do the rotation (90 degrees clockwise)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      result[x][N - 1 - y] = paddedMatrix[y][x] || 0;
    }
  }

  // Trim empty rows and columns
  // Trim empty rows from top and bottom
  const trimmed = result.filter(row => row.some(cell => cell !== 0));

  // Trim empty columns from left and right
  const cols = trimmed[0]?.length || 0;
  let startCol = 0;
  let endCol = cols - 1;

  for (let x = 0; x < cols; x++) {
    if (trimmed.some(row => row[x] !== 0)) {
      startCol = x;
      break;
    }
  }

  for (let x = cols - 1; x >= 0; x--) {
    if (trimmed.some(row => row[x] !== 0)) {
      endCol = x;
      break;
    }
  }

  // Extract the non-empty part
  return trimmed.map(row => row.slice(startCol, endCol + 1));
};

// SRS wall kick data for JLSTZ pieces
export const SRS_KICKS = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: -2 },
  { x: -1, y: -2 },
];

// SRS wall kick data for I piece
export const SRS_I_KICKS = [
  { x: 0, y: 0 },
  { x: -2, y: 0 },
  { x: 1, y: 0 },
  { x: -2, y: -1 },
  { x: 1, y: 2 },
];

/**
 * Gets the appropriate SRS kicks for a piece type and rotation
 * @param type The piece type identifier
 * @param from The current rotation state (0-3)
 * @param to The target rotation state (0-3)
 * @returns An array of kick offsets to try
 */
export const getSRSKicks = (type: string, from: number, to: number) => {
  // Only 4 states: 0 (spawn), 1 (right), 2 (reverse), 3 (left)
  // SRS uses (from, to) to select the correct kick table
  // For simplicity, use the same kicks for all transitions except I piece
  if (type === 'I') {
    // SRS I piece has unique tables for each rotation transition
    // We'll use the standard right rotation table for all for simplicity
    return SRS_I_KICKS;
  }
  if (type === 'O') {
    // O piece rotates in place
    return [{ x: 0, y: 0 }];
  }
  return SRS_KICKS;
};

/**
 * Maps piece type numbers to their string identifiers
 */
export const PIECE_TYPE_MAP: Record<number, string> = {
  1: 'I', 2: 'J', 3: 'L', 4: 'O', 5: 'S', 6: 'T', 7: 'Z'
};
