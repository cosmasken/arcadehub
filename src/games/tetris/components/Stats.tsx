import React from 'react';
import { useGame } from '../context';

const Stats: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Stats</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Score:</span>
          <span className="font-mono">{state.stats.score.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Level:</span>
          <span className="font-mono">{state.stats.level}</span>
        </div>
        <div className="flex justify-between">
          <span>Lines:</span>
          <span className="font-mono">{state.stats.linesCleared}</span>
        </div>
        <div className="flex justify-between">
          <span>Pieces:</span>
          <span className="font-mono">{state.stats.totalPieces}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
