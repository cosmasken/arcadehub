// Game constants
export const COLS = 10;
export const ROWS = 20;
export const SHAPES = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  // O
  [
    [1, 1],
    [1, 1]
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
];

// Helper functions
export const createBoard = (): number[][] => {
  const board: number[][] = [];
  for (let i = 0; i < ROWS; i++) {
    board.push(Array(COLS).fill(0));
  }
  return board;
};

export const getRandomPiece = (): number => 
  Math.floor(Math.random() * (SHAPES.length - 1)) + 1;

export const isValidMove = (board: number[][], shape: number[][], position: {x: number, y: number}): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 0) continue;
      const newX = position.x + x;
      const newY = position.y + y;
      
      if (
        newX < 0 || 
        newX >= COLS || 
        newY >= ROWS ||
        (newY >= 0 && board[newY][newX] !== 0)
      ) {
        return false;
      }
    }
  }
  return true;
};

export const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const rotated: number[][] = [];
  
  for (let x = 0; x < cols; x++) {
    const newRow: number[] = [];
    for (let y = rows - 1; y >= 0; y--) {
      newRow.push(matrix[y][x]);
    }
    rotated.push(newRow);
  }
  
  return rotated;
};
