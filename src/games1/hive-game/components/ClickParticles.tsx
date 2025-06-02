
import React from "react";

interface ClickParticlesProps {
  x: number;
  y: number;
}

export const ClickParticles: React.FC<ClickParticlesProps> = ({ x, y }) => {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {/* Multiple honey droplets flying out */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60) * (Math.PI / 180); // 60 degrees apart
        const distance = 50 + Math.random() * 30;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        return (
          <div
            key={i}
            className="absolute text-yellow-500 text-lg font-bold"
            style={{
              animation: `flyOut 0.5s ease-out forwards`,
              transform: `translate(${endX}px, ${endY}px) scale(0.5)`,
              opacity: 0,
            }}
          >
            +{Math.floor(Math.random() * 3) + 1}
          </div>
        );
      })}
      
      <style>
        {`
          @keyframes flyOut {
            0% { 
              transform: translate(0, 0) scale(1); 
              opacity: 1; 
            }
            100% { 
              transform: translate(var(--end-x, 0), var(--end-y, 0)) scale(0.5); 
              opacity: 0; 
            }
          }
        `}
      </style>
    </div>
  );
};
