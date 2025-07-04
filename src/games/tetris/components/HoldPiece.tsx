import React, { useRef, useEffect } from 'react';
import { useGame } from '../context';
import { drawBlock } from '../utils/draw';
import { COLS, SHAPES } from '../constants';

const HoldPiece: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no piece is being held, show empty state
    if (state.holdPiece === null) {
      // Draw a placeholder or just leave it empty
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    const pieceType = state.holdPiece;
    const shape = SHAPES[pieceType];
    
    // Skip if shape is invalid
    if (!shape || !Array.isArray(shape) || shape.length === 0) return;
    
    const blockSize = 20;
    const shapeRows = shape.length;
    const shapeCols = Math.max(...shape.map(row => row.length));
    
    // Calculate the center position
    const offsetX = Math.floor((canvas.width - shapeCols * blockSize) / 2);
    const offsetY = Math.floor((canvas.height - shapeRows * blockSize) / 2);
    
    // Draw the piece
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(
            ctx, 
            (x * blockSize + offsetX) / blockSize, 
            (y * blockSize + offsetY) / blockSize, 
            pieceType, 
            blockSize
          );
        }
      });
    });
  }, [state.holdPiece]);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Hold</h3>
      <canvas
        ref={canvasRef}
        width={COLS * 20}
        height={120}
        className="bg-gray-900/30 rounded-lg border border-gray-700"
      />
    </div>
  );
};

export default HoldPiece;
