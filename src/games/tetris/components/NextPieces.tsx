import React, { useRef, useEffect } from 'react';
import { useGame } from '../context';
import { drawBlock } from '../utils/draw';
import { COLS, SHAPES } from '../constants';

const NextPieces: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const blockSize = 20;
    const pieceHeight = 4 * blockSize;
    const padding = 10;
    
    // Ensure nextPieces is an array and draw each piece
    const nextPieces = Array.isArray(state.nextPieces) ? state.nextPieces : [];
    nextPieces.forEach((pieceType, index) => {
      // Skip if pieceType is invalid or shape doesn't exist
      if (typeof pieceType !== 'number' || !SHAPES[pieceType] || !SHAPES[pieceType][0]) {
        return;
      }
      
      const shape = SHAPES[pieceType][0]; // Get the first rotation
      if (!Array.isArray(shape) || shape.length === 0) return;
      
      const shapeRow = shape[0];
      const rowLength = Array.isArray(shapeRow) ? shapeRow.length : 0;
      const offsetX = Math.floor((COLS * blockSize - rowLength * blockSize) / 2);
      const offsetY = index * (pieceHeight + padding) + padding;
      
      // Draw the piece with null checks
      shape.forEach((row, y) => {
        if (Array.isArray(row)) {
          row.forEach((value, x) => {
            if (value) {
              drawBlock(ctx, x * blockSize + offsetX, y * blockSize + offsetY, pieceType, blockSize);
            }
          });
        }
      });
    });
  }, [state.nextPieces]);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Next</h3>
      <canvas
        ref={canvasRef}
        width={COLS * 20}
        height={state.nextPieces.length * 100}
        className="bg-gray-900 rounded"
      />
    </div>
  );
};

export default NextPieces;
