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
    
    // Draw next pieces
    state.nextPieces.forEach((pieceType, index) => {
      const shape = SHAPES[pieceType][0]; // Get the first rotation
      const offsetX = Math.floor((COLS * blockSize - shape[0].length * blockSize) / 2);
      const offsetY = index * (pieceHeight + padding) + padding;
      
      // Draw the piece
      shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, x * blockSize + offsetX, y * blockSize + offsetY, pieceType, blockSize);
          }
        });
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
