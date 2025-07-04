import React, { createContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { GameState, GameAction, GameContextType, Direction } from './types';
import { getInitialState, getRandomPosition, generateObstacles } from './initialState';
import { GRID_SIZE, DIRECTIONS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';
import { Position } from './types';

// Helper functions
// Re-export for backward compatibility
export { getInitialState, getRandomPosition, generateObstacles };

// Game context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper function to check if a position is occupied by an obstacle
const isPositionOccupied = (x: number, y: number, obstacles: Position[]): boolean => {
  return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE': {
      if (state.gameOver || !state.isStarted || state.isPaused) return state;
      
      // Create a deep copy of the snake and obstacles
      const newSnake = state.snake.map(segment => ({ ...segment }));
      const head = newSnake[0];
      const direction = state.nextDirection;
      const currentLevel = LEVELS[state.level - 1];
      
      // Calculate next position
      let newHeadX = head.x;
      let newHeadY = head.y;
      
      // Update position based on direction
      switch (direction) {
        case 'UP': newHeadY--; break;
        case 'DOWN': newHeadY++; break;
        case 'LEFT': newHeadX--; break;
        case 'RIGHT': newHeadX++; break;
      }
      
      // Handle wall collision or wrap around
      if (currentLevel.allowWallPass) {
        // Wrap around if wall passing is allowed
        if (newHeadX < 0) newHeadX = GRID_SIZE - 1;
        else if (newHeadX >= GRID_SIZE) newHeadX = 0;
        if (newHeadY < 0) newHeadY = GRID_SIZE - 1;
        else if (newHeadY >= GRID_SIZE) newHeadY = 0;
      } else {
        // Check for wall collision
        if (newHeadX < 0 || newHeadX >= GRID_SIZE || newHeadY < 0 || newHeadY >= GRID_SIZE) {
          // Game over - show menu
          return {
            ...state,
            gameOver: true,
            isStarted: false,
            isPaused: true,
            showMenu: true,
            menuType: 'gameOver',
            highScore: Math.max(state.score, state.highScore)
          };
        }
      }
      
      // Check for obstacle collision
      if (isPositionOccupied(newHeadX, newHeadY, state.obstacles)) {
        return {
          ...state,
          gameOver: true,
          isStarted: false,
          isPaused: true,
          showMenu: true,
          menuType: 'gameOver',
          highScore: Math.max(state.score, state.highScore)
        };
      }
      
      // Check for self collision (skip the head)
      if (newSnake.some((segment, index) => index > 0 && segment.x === newHeadX && segment.y === newHeadY)) {
        return { ...state, gameOver: true };
      }
      
      // Check for food collision
      const foodEaten = newHeadX === state.food.x && newHeadY === state.food.y;
      
      // Store previous positions for body segments
      const prevPositions = newSnake.map(segment => ({
        x: segment.x,
        y: segment.y,
        dx: segment.dx,
        dy: segment.dy,
        targetX: segment.targetX,
        targetY: segment.targetY,
        moving: segment.moving,
        direction: segment.direction
      }));
      
      // Move the head
      head.x = newHeadX;
      head.y = newHeadY;
      head.direction = direction;
      
      // Update body segments to follow the head with a one-cell delay
      for (let i = 1; i < newSnake.length; i++) {
        newSnake[i] = { ...prevPositions[i - 1] };
      }
      
      // Handle food collection and growth
      if (foodEaten) {
        // Add new segment at the end of the snake
        const tail = newSnake[newSnake.length - 1];
        // Find the last segment that's not moving to attach the new segment
        let lastSegment = tail;
        if (tail.moving) {
          // If tail is moving, find the last non-moving segment
          for (let i = newSnake.length - 2; i >= 0; i--) {
            if (!newSnake[i].moving) {
              lastSegment = newSnake[i];
              break;
            }
          }
        }
        
        // Add new segment at the position of the last non-moving segment
        newSnake.push({
          ...lastSegment,
          x: lastSegment.x,
          y: lastSegment.y,
          dx: 0,
          dy: 0,
          targetX: lastSegment.x,
          targetY: lastSegment.y,
          moving: false
        });
        
        // Update score and level
        const newScore = state.score + 10 * state.level;
        const newLinesCleared = state.linesCleared + 1;
        const newLevel = state.level;
        
        // Level up check
        const nextLevel = LEVELS.find(l => l.level === newLevel + 1);
        if (nextLevel && newLinesCleared >= nextLevel.linesNeeded) {
          // Trigger level complete instead of auto-progress
          return {
            ...state,
            score: newScore,
            linesCleared: newLinesCleared,
            showMenu: true,
            menuType: 'levelComplete',
            isPaused: true,
          };
        }
        
        return {
          ...state,
          snake: newSnake,
          food: getRandomPosition(),
          score: newScore,
          linesCleared: newLinesCleared,
          level: newLevel,
          direction: state.nextDirection, // Ensure direction is updated
          foodEaten: state.foodEaten + 1,
        };
      }
      
      return {
        ...state,
        snake: newSnake,
        direction: state.nextDirection,
        moveCount: state.moveCount + 1,
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
      
      // Update direction immediately
      return {
        ...state,
        direction: action.direction,
        nextDirection: action.direction
      };
    
    case 'START_GAME': {
      const newFood = getRandomPosition();
      const newSnake = [{
        x: 10,
        y: 10,
        dx: 0,
        dy: 0,
        targetX: 10,
        targetY: 10,
        moving: false,
        direction: 'RIGHT' as const
      }];
      const obstacles = generateObstacles(state.level, newSnake, newFood);
      
      return {
        ...state,
        isLoading: false,
        showMenu: false,
        menuType: null,
        isStarted: true,
        gameOver: false,
        isPaused: false,
        snake: newSnake,
        food: newFood,
        obstacles,
        direction: DIRECTIONS.RIGHT,
        nextDirection: DIRECTIONS.RIGHT,
        score: 0,
        linesCleared: 0,
        foodEaten: 0,
        moveCount: 0,
        gameStartTime: Date.now(),
        gameDuration: 0,
        comboMultiplier: 1,
      };
    }
    
    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: action.isPaused,
        showMenu: action.isPaused,
        menuType: action.isPaused ? 'pause' : null,
      };

    case 'RESET_GAME':
      return {
        ...getInitialState(action.level || 1),
        isLoading: false,
        showMenu: true,
        menuType: 'start',
        highScore: state.highScore, // Preserve high score
        isPaused: false, // Reset pause state
        isStarted: false, // Ensure not started until START
        gameOver: false,
      };

    case 'START':
      return {
        ...state,
        isStarted: true,
        isPaused: false,
        gameOver: false,
        showMenu: false,
        menuType: null,
      };

    case 'LEVEL_COMPLETE':
      return {
        ...state,
        isPaused: true,
        showMenu: true,
        menuType: 'levelComplete',
      };

    case 'NEXT_LEVEL': {
      const nextLevel = state.level + 1;
      return {
        ...getInitialState(nextLevel),
        isLoading: false,
        showMenu: false,
        menuType: null,
        highScore: state.highScore,
        isPaused: false,
        isStarted: true,
        gameOver: false,
        level: nextLevel,
      };
    }

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
      
      // Achievement unlocked
      console.log(`Achievement Unlocked: ${achievement.name}! +${achievement.reward} coins`);
      
      return {
        ...state,
        achievements: [...state.achievements, action.achievementId],
        coins: state.coins + achievement.reward,
      };
    }
    
    case 'SPLASH_COMPLETE':
      return {
        ...state,
        isLoading: false,
        showMenu: true,
        menuType: 'start',
        isStarted: false,
        isPaused: false,
      };
    default:
      return state;
  }
};

// Context provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  
  // Game loop
  useEffect(() => {
    // Clear any existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }

    if (!state.isStarted || state.gameOver || state.isPaused) return;
    
    const gameLoop = setInterval(() => {
      dispatch({ type: 'MOVE' });
    }, state.settings.gameSpeed);

    gameLoopRef.current = gameLoop;
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    };
  }, [state.isStarted, state.gameOver, state.isPaused, state.settings.gameSpeed]);
  
  // Save game state when it changes
  useEffect(() => {
    // Only save if the game has started and not game over
    if (state.isStarted && !state.gameOver) {
      localStorage.setItem('snake-save', JSON.stringify(state));
    } else if (!state.isStarted && !state.gameOver) {
      // Clear saved state when game is not started and not game over
      localStorage.removeItem('snake-save');
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
    dispatch({ type: 'PAUSE_GAME', isPaused: true });
  }, []);

  const resetGame = useCallback((level?: number) => {
    dispatch({ type: 'RESET_GAME', level });
  }, []);

  const changeDirection = useCallback((direction: Direction) => {
    dispatch({ type: 'CHANGE_DIRECTION', direction });
  }, []);

  const buyItem = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find(item => item.id === itemId);
    if (item) {
      dispatch({ type: 'BUY_ITEM', itemId, cost: item.price });
    }
  }, []);

  const claimAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
  }, []);
  
  // --- Save/Load Game Feature ---
  // Stub: Replace with real on-chain logic
  const checkOnChainSave = async (userAddress: string): Promise<boolean> => {
    // TODO: Query blockchain for existing save for userAddress
    // Return true if found, false otherwise
    return false;
  };

  const saveGame = async (userAddress: string) => {
    const onChainExists = await checkOnChainSave(userAddress);
    if (!onChainExists) {
      // TODO: Save to chain here
      // For now, just save locally
      localStorage.setItem('snake-save', JSON.stringify(state));
    } else {
      // TODO: Prompt user to overwrite or handle as needed
      // For now, just overwrite local
      localStorage.setItem('snake-save', JSON.stringify(state));
    }
  };

  const loadGame = async (userAddress: string) => {
    const onChainExists = await checkOnChainSave(userAddress);
    if (onChainExists) {
      // TODO: Load from chain
      // For now, fallback to local
    }
    const saved = localStorage.getItem('snake-save');
    if (saved) {
      const parsed = JSON.parse(saved);
      dispatch({ type: 'RESET_GAME', ...parsed });
    }
  };

  const value = {
    state,
    dispatch,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    buyItem,
    claimAchievement,
    saveGame,
    loadGame,
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
