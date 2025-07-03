import React, { useRef, useEffect } from 'react';
import { useGame } from '../context';
import { drawBlock } from '../utils/draw';
import { COLS, SHAPES } from '../constants';

// Define the shape of our tetromino pieces
type TetrominoType = 1 | 2 | 3 | 4 | 5 | 6 | 7; // The possible tetromino types

const HoldPiece: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || state.holdPiece === null) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get the shape for the held piece
    const pieceType = state.holdPiece as TetrominoType;
    const shape = SHAPES[pieceType];
    
    if (!shape || shape.length === 0) return; // Skip if no shape found
    
    const blockSize = 20;
    
    // The shape is already a 2D array, no need to get the first rotation
    const pieceShape = shape as number[][];
    
    // Calculate shape dimensions
    const shapeHeight = pieceShape.length;
    const shapeWidth = pieceShape[0].length;
    
    // Calculate offset to center the piece
    const offsetX = Math.floor((canvas.width - shapeWidth * blockSize) / 2);
    const offsetY = Math.floor((canvas.height - shapeHeight * blockSize) / 2);
    
    // Draw the piece
    pieceShape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, x * blockSize + offsetX, y * blockSize + offsetY, pieceType, blockSize);
        }
      });
    });
  }, [state.holdPiece]);
  
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * 20}
          height={80}
          className="bg-gray-900/30 rounded-lg border border-gray-700"
        />
      </div>
    </div>
  );
};

export default HoldPiece;
