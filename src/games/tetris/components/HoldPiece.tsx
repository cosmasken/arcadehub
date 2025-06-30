import React, { useRef, useEffect } from 'react';
import { useGame } from '../context';
import { drawBlock } from '../utils/draw';
import { COLS } from '../constants';

const HoldPiece: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !state.holdPiece) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the held piece
    const pieceType = state.holdPiece;
    const shape = SHAPES[pieceType][0]; // Get the first rotation
    const blockSize = 20;
    
    // Calculate offset to center the piece
    const offsetX = Math.floor((COLS * blockSize - shape[0].length * blockSize) / 2);
    const offsetY = 10;
    
    // Draw the piece
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, x * blockSize + offsetX, y * blockSize + offsetY, pieceType, blockSize);
        }
      });
    });
  }, [state.holdPiece]);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Hold</h3>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * 20}
          height={80}
          className="bg-gray-900 rounded"
        />
      </div>
    </div>
  );
};

export default HoldPiece;
