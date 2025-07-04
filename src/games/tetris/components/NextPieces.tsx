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
      if (typeof pieceType !== 'number' || !SHAPES[pieceType]) {
        return;
      }
      const shape = SHAPES[pieceType]; // Use the full 2D array
      if (!Array.isArray(shape) || shape.length === 0) return;

      // Calculate the bounding box for the shape
      const shapeRows = shape.length;
      const shapeCols = Math.max(...shape.map(row => row.length));
      // Center each piece in its preview box
      const previewBoxHeight = pieceHeight;
      const previewBoxWidth = COLS * blockSize;
      const offsetX = Math.floor((previewBoxWidth - shapeCols * blockSize) / 2);
      const offsetY = index * (previewBoxHeight + padding) + Math.floor((previewBoxHeight - shapeRows * blockSize) / 2);

      // Draw the piece
      shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, x + offsetX / blockSize, y + offsetY / blockSize, pieceType, blockSize);
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
