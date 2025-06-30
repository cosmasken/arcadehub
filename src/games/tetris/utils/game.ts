import { Position } from '../types';

/**
 * Checks if a tetromino can be placed at the specified position
 * @param board The game board
 * @param shape The tetromino shape
 * @param position The position to check
 * @returns True if the move is valid, false otherwise
 */
export const isValidMove = (board: number[][], shape: number[][], position: Position): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = position.x + x;
        const boardY = position.y + y;
        
        // Check if the piece is outside the board boundaries or collides with existing pieces
        if (
          boardX < 0 || 
          boardX >= board[0].length || 
          boardY >= board.length ||
          (boardY >= 0 && board[boardY][boardX] !== 0)
        ) {
          return false;
        }
      }
    }
  }
  return true;
};
