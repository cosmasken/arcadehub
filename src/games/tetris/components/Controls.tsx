import React, { useEffect } from 'react';
import { useGame } from '../context';

const Controls: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const handleStartPause = () => {
    if (state.gameOver) {
      dispatch({ type: 'RESET' });
      dispatch({ type: 'START' });
    } else if (state.isPaused) {
      dispatch({ type: 'PAUSE' }); // This will resume the game
    } else {
      dispatch({ type: 'PAUSE' }); // This will pause the game
    }
  };


  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={() => dispatch({ type: 'MOVE_LEFT' })}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        ←
      </button>
      <button
        onClick={() => dispatch({ type: 'MOVE_RIGHT' })}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        →
      </button>
      <button
        onClick={() => dispatch({ type: 'ROTATE' })}
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Rotate
      </button>
      <button
        onClick={() => dispatch({ type: 'SOFT_DROP' })}
        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Soft Drop
      </button>
      <button
        onClick={() => dispatch({ type: 'HARD_DROP' })}
        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Hard Drop
      </button>
      <button
        onClick={() => dispatch({ type: 'HOLD' })}
        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded disabled:opacity-50"
        disabled={!state.isStarted || state.isPaused || state.gameOver || !state.canHold}
      >
        Hold
      </button>
      <button
        onClick={() => dispatch({ type: 'PAUSE' })}
        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded col-span-2 disabled:opacity-50"
        disabled={!state.isStarted || state.gameOver}
      >
        {state.isPaused ? 'Resume (P)' : 'Pause (P)'}
      </button>
      <button
        onClick={handleStartPause}
        className={`${state.gameOver ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white p-3 rounded font-bold text-lg col-span-2`}
      >
        {state.gameOver ? 'Play Again' : state.isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default Controls;
