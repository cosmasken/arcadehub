import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, GameContextType, Position, Direction } from './types';
import { GRID_SIZE, INITIAL_GAME_SPEED, DIRECTIONS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';

// Helper functions
const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
  dx: 0,
  dy: 0,
  targetX: 0,
  targetY: 0,
  moving: false
});

const getInitialState = (): GameState => {
  return {
    snake: [{
    x: 10,
    y: 10,
    dx: 0,
    dy: 0,
    targetX: 10,
    targetY: 10,
    moving: false
  }],
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
    // Tournament enhancements
    gameStartTime: 0,
    gameDuration: 0,
    moveCount: 0,
    foodEaten: 0,
    comboMultiplier: 1,
    maxCombo: 0,
    perfectMoves: 0,
    gameMode: 'classic',
    timeLimit: undefined,
    targetScore: undefined,
    gameSeed: Math.random().toString(36).substring(2, 15), // Random seed
  };
};

// Game context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE': {
      if (state.gameOver || !state.isStarted || state.isPaused) return state;
      
      // Create a deep copy of the snake
      const newSnake = state.snake.map(segment => ({ ...segment }));
      const head = newSnake[0];
      const direction = state.nextDirection;
      
      // If head is not currently moving, set up movement to next cell
      if (!head.moving) {
        // Calculate next position
        let newX = head.x;
        let newY = head.y;
        
        switch (direction) {
          case 'UP': newY--; break;
          case 'DOWN': newY++; break;
          case 'LEFT': newX--; break;
          case 'RIGHT': newX++; break;
        }
        
        // Handle wall collision or wrap around
        if (state.settings.wallCollision) {
          if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
            return { ...state, gameOver: true };
          }
        } else {
          if (newX < 0) newX = GRID_SIZE - 1;
          if (newX >= GRID_SIZE) newX = 0;
          if (newY < 0) newY = GRID_SIZE - 1;
          if (newY >= GRID_SIZE) newY = 0;
        }
        
        // Check for self collision (only check current grid position, not sub-cell)
        if (newSnake.some((segment, index) => 
          index > 0 && segment.x === newX && segment.y === newY)) {
          return { ...state, gameOver: true };
        }
        
        // Set up movement for the head
        head.targetX = newX;
        head.targetY = newY;
        head.dx = 0;
        head.dy = 0;
        head.moving = true;
        head.direction = direction;
      }
      
      // Update movement for all segments
      const moveSpeed = 0.1; // Adjust this value for faster/slower movement
      let foodEaten = false;
      
      // Update head position
      if (head.moving) {
        // Calculate direction vector
        const targetDx = head.x < head.targetX ? 1 : head.x > head.targetX ? -1 : 0;
        const targetDy = head.y < head.targetY ? 1 : head.y > head.targetY ? -1 : 0;
        
        // Update sub-cell position
        head.dx += targetDx * moveSpeed;
        head.dy += targetDy * moveSpeed;
        
        // Check if reached target cell
        if (Math.abs(head.dx) >= 1 || Math.abs(head.dy) >= 1) {
          head.x = head.targetX;
          head.y = head.targetY;
          head.dx = 0;
          head.dy = 0;
          head.moving = false;
          
          // Check for food collision after moving to new cell
          if (head.x === state.food.x && head.y === state.food.y) {
            foodEaten = true;
          }
        } else if (head.x === state.food.x && head.y === state.food.y) {
          // Also check for food during movement
          foodEaten = true;
        }
      }
      
      // Update body segments to follow the head
      for (let i = 1; i < newSnake.length; i++) {
        const current = newSnake[i];
        const prev = newSnake[i - 1];
        
        // If previous segment is moving, start moving this segment
        if (!current.moving && (prev.moving || prev.x !== current.x || prev.y !== current.y)) {
          current.targetX = prev.x;
          current.targetY = prev.y;
          current.dx = 0;
          current.dy = 0;
          current.moving = true;
        }
        
        // Update position if moving
        if (current.moving) {
          const targetDx = current.x < current.targetX ? 1 : current.x > current.targetX ? -1 : 0;
          const targetDy = current.y < current.targetY ? 1 : current.y > current.targetY ? -1 : 0;
          
          current.dx += targetDx * moveSpeed;
          current.dy += targetDy * moveSpeed;
          
          // Check if reached target cell
          if (Math.abs(current.dx) >= 1 || Math.abs(current.dy) >= 1) {
            current.x = current.targetX;
            current.y = current.targetY;
            current.dx = 0;
            current.dy = 0;
            current.moving = false;
          }
        }
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
        let newLevel = state.level;
        
        // Level up check
        const nextLevel = LEVELS.find(l => l.level === newLevel + 1);
        if (nextLevel && newLinesCleared >= nextLevel.linesNeeded) {
          newLevel++;
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
