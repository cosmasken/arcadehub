import { GameState } from '../types';

/**
 * Game state utility functions for better state management
 */

export type GameStatus = 'loading' | 'start' | 'playing' | 'paused' | 'gameOver';

/**
 * Determines the current game status based on state
 */
export const getGameStatus = (state: GameState): GameStatus => {
  if (state.gameOver) return 'gameOver';
  if (!state.isStarted) return 'start';
  if (state.isPaused) return 'paused';
  return 'playing';
};

/**
 * Determines if the game menu should be shown
 */
export const shouldShowMenu = (state: GameState): boolean => {
  const status = getGameStatus(state);
  return status === 'start' || status === 'paused' || status === 'gameOver';
};

/**
 * Determines the menu type based on game state
 */
export const getMenuType = (state: GameState): 'start' | 'pause' | 'gameOver' => {
  const status = getGameStatus(state);
  switch (status) {
    case 'gameOver': return 'gameOver';
    case 'paused': return 'pause';
    default: return 'start';
  }
};

/**
 * Checks if the game can accept input
 */
export const canAcceptInput = (state: GameState): boolean => {
  return getGameStatus(state) === 'playing';
};

/**
 * Gets formatted score display information
 */
export const getScoreDisplay = (state: GameState) => {
  const { score, highScore, level, linesCleared } = state.stats;
  
  return {
    current: score,
    high: highScore,
    level,
    lines: linesCleared,
    showHighScore: highScore > 0,
    isNewHighScore: score > 0 && score >= highScore,
    nextLevelLines: Math.max(0, (level * 10) - linesCleared),
    levelProgress: linesCleared % 10,
    levelProgressMax: 10
  };
};

/**
 * Gets game statistics for display
 */
export const getGameStats = (state: GameState) => {
  const { stats } = state;
  const gameTime = stats.gameTime || 0;
  const piecesPerMinute = gameTime > 0 ? (stats.totalPieces / (gameTime / 60000)) : 0;
  const linesPerMinute = gameTime > 0 ? (stats.linesCleared / (gameTime / 60000)) : 0;
  
  return {
    score: stats.score,
    level: stats.level,
    lines: stats.linesCleared,
    pieces: stats.totalPieces,
    tetrisCount: stats.tetrisCount,
    gameTime: formatTime(gameTime),
    piecesPerMinute: Math.round(piecesPerMinute * 10) / 10,
    linesPerMinute: Math.round(linesPerMinute * 10) / 10,
    efficiency: stats.linesCleared > 0 ? Math.round((stats.tetrisCount * 4 / stats.linesCleared) * 100) : 0
  };
};

/**
 * Formats time in milliseconds to MM:SS format
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Gets control instructions based on current settings
 */
export const getControlInstructions = (controls?: any) => {
  const defaultControls = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotate: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    hold: 'KeyC',
    pause: 'KeyP'
  };
  
  const currentControls = { ...defaultControls, ...controls };
  
  return {
    movement: `Use ${formatKey(currentControls.moveLeft)}/${formatKey(currentControls.moveRight)} to move`,
    rotation: `Use ${formatKey(currentControls.rotate)} to rotate`,
    dropping: `Use ${formatKey(currentControls.softDrop)} for soft drop, ${formatKey(currentControls.hardDrop)} for hard drop`,
    hold: `Use ${formatKey(currentControls.hold)} to hold piece`,
    pause: `Use ${formatKey(currentControls.pause)} to pause`,
    objective: 'Clear complete horizontal lines to score points',
    strategy: 'Stack pieces efficiently and aim for Tetris (4 lines at once)'
  };
};

/**
 * Formats key names for display
 */
export const formatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Space': 'Space',
    'KeyC': 'C',
    'KeyP': 'P',
    'Enter': 'Enter',
    'Escape': 'Esc'
  };
  
  return keyMap[key] || key;
};

/**
 * Calculates level progression
 */
export const getLevelProgression = (state: GameState) => {
  const { level, linesCleared } = state.stats;
  const currentLevelLines = (level - 1) * 10;
  const nextLevelLines = level * 10;
  const progressLines = linesCleared - currentLevelLines;
  const remainingLines = nextLevelLines - linesCleared;
  
  return {
    currentLevel: level,
    progressLines: Math.max(0, progressLines),
    remainingLines: Math.max(0, remainingLines),
    totalLinesForLevel: 10,
    progressPercentage: Math.min(100, (progressLines / 10) * 100),
    isMaxLevel: level >= 8 // Based on LEVELS constant
  };
};

/**
 * Determines if a new high score was achieved
 */
export const checkNewHighScore = (currentScore: number, previousHighScore: number): boolean => {
  return currentScore > previousHighScore && previousHighScore > 0;
};

/**
 * Gets achievement progress (placeholder for future implementation)
 */
export const getAchievementProgress = (state: GameState) => {
  const { stats } = state;
  
  return {
    totalAchievements: 10, // Placeholder
    unlockedAchievements: stats.achievements?.length || 0,
    recentAchievements: stats.achievements?.slice(-3) || [],
    progressPercentage: ((stats.achievements?.length || 0) / 10) * 100
  };
};

/**
 * Validates game state integrity
 */
export const validateGameState = (state: GameState): boolean => {
  try {
    // Check required properties exist
    if (!state.board || !Array.isArray(state.board)) return false;
    if (!state.stats || typeof state.stats !== 'object') return false;
    if (!state.settings || typeof state.settings !== 'object') return false;
    
    // Check board dimensions
    if (state.board.length !== 22) return false; // ROWS
    if (state.board[0]?.length !== 10) return false; // COLS
    
    // Check stats are valid numbers
    if (typeof state.stats.score !== 'number' || state.stats.score < 0) return false;
    if (typeof state.stats.level !== 'number' || state.stats.level < 1) return false;
    if (typeof state.stats.linesCleared !== 'number' || state.stats.linesCleared < 0) return false;
    
    return true;
  } catch (error) {
    console.error('Game state validation error:', error);
    return false;
  }
};

/**
 * Creates a safe copy of game state for saving/loading
 */
export const sanitizeGameState = (state: GameState): Partial<GameState> => {
  return {
    board: state.board.map(row => [...row]),
    currentPiece: state.currentPiece ? {
      ...state.currentPiece,
      shape: state.currentPiece.shape.map(row => [...row])
    } : null,
    nextPieces: [...state.nextPieces],
    holdPiece: state.holdPiece,
    canHold: state.canHold,
    gameOver: state.gameOver,
    isPaused: state.isPaused,
    isStarted: state.isStarted,
    stats: { ...state.stats },
    settings: { ...state.settings }
  };
};
