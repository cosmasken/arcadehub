import { GameState } from '../types';

/**
 * Utility functions for managing game state transitions
 */

export const getGameStatus = (state: GameState) => {
  if (state.isLoading) return 'loading';
  if (state.gameOver) return 'gameOver';
  if (!state.isStarted) return 'notStarted';
  if (state.isPaused) return 'paused';
  if (state.menuType === 'levelComplete') return 'levelComplete';
  return 'playing';
};

export const shouldShowMenu = (state: GameState, uiState: any) => {
  const status = getGameStatus(state);
  return (
    !uiState.showLoginPrompt && 
    (status === 'notStarted' || status === 'paused' || status === 'gameOver' || status === 'levelComplete')
  );
};

export const getMenuType = (state: GameState) => {
  const status = getGameStatus(state);
  switch (status) {
    case 'gameOver': return 'gameOver';
    case 'levelComplete': return 'levelComplete';
    case 'paused': return 'pause';
    default: return 'start';
  }
};

export const canAcceptInput = (state: GameState) => {
  const status = getGameStatus(state);
  return status === 'playing';
};

export const getScoreDisplay = (state: GameState) => {
  return {
    current: state.score,
    high: state.highScore,
    level: state.level,
    foodEaten: state.foodEaten,
    showHighScore: state.highScore > 0,
    isNewHighScore: state.score > 0 && state.score >= state.highScore
  };
};

export const getGameInstructions = (useWASD: boolean) => {
  const controls = useWASD ? 'WASD' : 'Arrow Keys';
  return {
    movement: `Use ${controls} to move`,
    objective: 'Eat food to grow your snake',
    avoid: 'Avoid walls and your own tail',
    pause: 'Press P to pause during game',
    restart: 'Press R to restart',
    shop: 'Press S to open shop',
    achievements: 'Press A to view achievements'
  };
};
