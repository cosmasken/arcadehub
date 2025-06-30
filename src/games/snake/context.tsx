import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, GameContextType, Position, Direction } from './types';
import { GRID_SIZE, INITIAL_GAME_SPEED, DIRECTIONS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';

// Helper functions
const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

const getInitialState = (): GameState => {
  const savedState = localStorage.getItem('snake-save');
  
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to parse saved game state', e);
    }
  }

  return {
    snake: [{ x: 10, y: 10 }],
    food: getRandomPosition(),
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    gameOver: false,
    isPaused: false,
    isStarted: false,
    score: 0,
    highScore: Number(localStorage.getItem('snake-highscore')) || 0,
    level: 1,
    linesCleared: 0,
    coins: 0,
    inventory: {},
    achievements: [],
    settings: {
      gridSize: GRID_SIZE,
      cellSize: 20,
      gameSpeed: INITIAL_GAME_SPEED,
      theme: 'classic',
      soundEnabled: true,
      musicEnabled: true,
      ghostPiece: false,
      wallCollision: true,
    },
  };
};

// Game context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE': {
      if (state.gameOver || !state.isStarted || state.isPaused) return state;
      
      const head = { ...state.snake[0] };
      const direction = state.nextDirection;
      
      // Update head position based on direction
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      
      // Check for wall collision if enabled
      if (state.settings.wallCollision && 
          (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE)) {
        return { ...state, gameOver: true };
      }
      
      // Wrap around if wall collision is off
      if (!state.settings.wallCollision) {
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;
      }
      
      // Check for self collision
      if (state.snake.some((segment, index) => 
        index > 0 && segment.x === head.x && segment.y === head.y)) {
        return { ...state, gameOver: true };
      }
      
      const newSnake = [head, ...state.snake];
      let newScore = state.score;
      let newLinesCleared = state.linesCleared;
      let newLevel = state.level;
      
      // Check if food is eaten
      if (head.x === state.food.x && head.y === state.food.y) {
        newScore += 10 * newLevel;
        newLinesCleared += 1;
        
        // Level up check
        const currentLevel = LEVELS.find(l => l.level === newLevel);
        const nextLevel = LEVELS.find(l => l.level === newLevel + 1);
        
        if (nextLevel && newLinesCleared >= nextLevel.linesNeeded) {
          newLevel += 1;
        }
        
        return {
          ...state,
          snake: newSnake,
          food: getRandomPosition(),
          score: newScore,
          linesCleared: newLinesCleared,
          level: newLevel,
          direction: state.nextDirection,
        };
      }
      
      // Remove tail if no food was eaten
      newSnake.pop();
      
      return {
        ...state,
        snake: newSnake,
        direction: state.nextDirection,
      };
    }
    
    case 'CHANGE_DIRECTION':
      // Prevent 180-degree turns
      if (
        (state.direction === 'UP' && action.direction === 'DOWN') ||
        (state.direction === 'DOWN' && action.direction === 'UP') ||
        (state.direction === 'LEFT' && action.direction === 'RIGHT') ||
        (state.direction === 'RIGHT' && action.direction === 'LEFT')
      ) {
        return state;
      }
      
      return {
        ...state,
        nextDirection: action.direction,
      };
      
    case 'GAME_OVER':
      return {
        ...state,
        gameOver: true,
        isStarted: false,
        highScore: Math.max(state.score, state.highScore),
      };
      
    case 'PAUSE':
      return { ...state, isPaused: !state.isPaused };
      
    case 'RESET':
      return getInitialState();
      
    case 'START':
      return { ...state, isStarted: true, gameOver: false };
      
    case 'INCREASE_SCORE':
      return { ...state, score: state.score + action.points };
      
    case 'BUY_ITEM': {
      const item = SHOP_ITEMS.find(item => item.id === action.itemId);
      if (!item || state.coins < item.price) return state;
      
      item.effect();
      
      return {
        ...state,
        coins: state.coins - item.price,
        inventory: {
          ...state.inventory,
          [item.id]: (state.inventory[item.id] || 0) + 1,
        },
      };
    }
    
    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.achievementId)) return state;
      
      const achievement = ACHIEVEMENTS.find(a => a.id === action.achievementId);
      if (!achievement) return state;
      
      return {
        ...state,
        achievements: [...state.achievements, action.achievementId],
        coins: state.coins + achievement.reward,
      };
    }
    
    default:
      return state;
  }
};

// Context provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);
  const gameLoopRef = useRef<number>();
  
  // Game loop
  useEffect(() => {
    if (!state.isStarted || state.gameOver || state.isPaused) return;
    
    const gameLoop = setInterval(() => {
      dispatch({ type: 'MOVE' });
    }, state.settings.gameSpeed);
    
    return () => clearInterval(gameLoop);
  }, [state.isStarted, state.gameOver, state.isPaused, state.settings.gameSpeed]);
  
  // Save game state when it changes
  useEffect(() => {
    // Only save if the game has started and not game over
    if (state.isStarted && !state.gameOver) {
      localStorage.setItem('snake-save', JSON.stringify(state));
    }
  }, [state]); // Using state as a dependency since we're using multiple properties
  
  // Check for achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!state.achievements.includes(achievement.id) && achievement.condition(state)) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId: achievement.id });
      }
    });
  }, [state]); // Using state as a dependency since the condition might depend on any state property
  
  // Expose game controls
  const startGame = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const changeDirection = useCallback((direction: Direction) => {
    dispatch({ type: 'CHANGE_DIRECTION', direction });
  }, []);

  const buyItem = useCallback((itemId: string) => {
    dispatch({ type: 'BUY_ITEM', itemId });
  }, []);

  const claimAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
  }, []);
  
  const value = {
    state,
    dispatch,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    buyItem,
    claimAchievement,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Export the useGame hook for components to use
export const useGame = () => {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Export the context as default
export default GameContext;
