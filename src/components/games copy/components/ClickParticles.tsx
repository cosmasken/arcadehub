
import React from 'react';

interface ClickParticlesProps {
  x: number;
  y: number;
  points: number;
}

export const ClickParticles = ({ x, y, points }: ClickParticlesProps) => {
  return (
    <>
      <style>
        {`
          @keyframes float {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -100px) scale(1.2);
            }
          }
        `}
      </style>
      <div
        className="absolute pointer-events-none text-yellow-500 font-bold text-lg"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          animation: 'float 1s ease-out forwards'
        }}
      >
        +{points} 🍯
      </div>
    </>
  );
};
