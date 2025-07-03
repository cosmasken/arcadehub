import { COLORS } from '../constants';

export const drawBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  blockSize: number = 40,
  padding: number = 1
): void => {
  const xPos = x * blockSize;
  const yPos = y * blockSize;
  
  // Draw block with 3D effect
  ctx.fillStyle = COLORS[value] || '#000000';
  ctx.fillRect(xPos + padding, yPos + padding, blockSize - padding * 2, blockSize - padding * 2);
  
  // Add highlight
  const highlight = ctx.createLinearGradient(xPos, yPos, xPos + blockSize, yPos + blockSize);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  highlight.addColorStop(1, 'transparent');
  ctx.fillStyle = highlight;
  ctx.fillRect(xPos + padding, yPos + padding, blockSize - padding * 2, blockSize - padding * 2);
  
  // Add shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = COLORS[value] || '#000000';
  ctx.fillRect(xPos + padding, yPos + padding, blockSize - padding * 2, blockSize - padding * 2);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

export const drawGhostBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  blockSize: number = 40,
  padding: number = 1
): void => {
  const xPos = x * blockSize;
  const yPos = y * blockSize;
  
  // Draw ghost piece with transparency
  ctx.fillStyle = `${COLORS[value] || '#000000'}40`; // 25% opacity
  ctx.fillRect(xPos, yPos, blockSize, blockSize);
  
  // Border for ghost piece
  ctx.strokeStyle = COLORS[value] || '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(xPos + padding, yPos + padding, blockSize - padding * 2, blockSize - padding * 2);
};
