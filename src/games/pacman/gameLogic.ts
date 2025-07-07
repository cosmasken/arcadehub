import { PacmanGameState, GameAction, Position } from './types';
import { 
  DIRECTIONS, 
  SCORES, 
  POWER_PELLET_DURATION, 
  GAME_STATES,
  GHOST_MODES,
  GHOST_SCARED_SPEED,
  GHOST_SPEED,
  GHOST_SCATTER_TIME,
  GHOST_CHASE_TIME,
  GRID_SIZE
} from './constants';
import { 
  checkCollision, 
  handleTunnelWrap, 
  isAtGridCenter, 
  pixelToGrid,
  isEntityCollision,
  gridToPixel
} from './utils/collision';
import { 
  updateGhostAI, 
  updateGhostMode, 
  shouldExitHouse, 
  hasReturnedToHouse,
  getGhostHouseExit 
} from './utils/ghostAI';
import { soundManager } from './utils/sounds';
import { createInitialGameState, resetGameEntities, nextLevel } from './gameState';

export const gameReducer = (state: PacmanGameState, action: GameAction): PacmanGameState => {
  switch (action.type) {
    case 'SET_DIRECTION':
      return {
        ...state,
        inputDirection: action.payload
      };
      
    case 'MOVE_PACMAN':
      return movePacman(state);
      
    case 'UPDATE_GHOSTS':
      return updateGhosts(state);
      
    case 'EAT_DOT':
      return eatDot(state, action.payload);
      
    case 'EAT_POWER_PELLET':
      return eatPowerPellet(state, action.payload);
      
    case 'EAT_GHOST':
      return eatGhost(state, action.payload);
      
    case 'LOSE_LIFE':
      return loseLife(state);
      
    case 'NEXT_LEVEL':
      return nextLevel(state);
      
    case 'PAUSE':
      return {
        ...state,
        gameState: GAME_STATES.PAUSED
      };
      
    case 'RESUME':
      return {
        ...state,
        gameState: GAME_STATES.PLAYING
      };
      
    case 'RESTART':
      const newState = {
        ...createInitialGameState(),
        highScore: state.highScore,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled
      };
      // Ensure game time starts at 0
      newState.gameTime = 0;
      newState.lastFrameTime = 0;
      return newState;
      
    case 'UPDATE_GAME_TIME':
      return updateGameTime(state, action.payload);
      
    case 'TOGGLE_SOUND':
      return {
        ...state,
        soundEnabled: !state.soundEnabled
      };
      
    default:
      return state;
  }
};

const movePacman = (state: PacmanGameState): PacmanGameState => {
  const { pacman, maze, inputDirection } = state;
  let newPacman = { ...pacman };
  
  // Update animation
  newPacman.animationFrame = (newPacman.animationFrame + 1) % 8;
  newPacman.mouthOpen = newPacman.animationFrame < 4;
  
  // Try to change direction if input is different and we're at grid center
  if (inputDirection !== 'NONE' && inputDirection !== pacman.direction) {
    const currentGridX = pixelToGrid(pacman.position.x);
    const currentGridY = pixelToGrid(pacman.position.y);
    
    // Only change direction when properly aligned to grid
    if (isAtGridCenter(pacman.position.x) && isAtGridCenter(pacman.position.y)) {
      const direction = DIRECTIONS[inputDirection];
      let nextX = currentGridX + direction.x;
      let nextY = currentGridY + direction.y;
      
      // Handle tunnel wrapping for direction checking
      if (nextX < 0) nextX = 18;
      else if (nextX >= 19) nextX = 0;
      
      // Check if the next position is valid (not a wall)
      if (nextY >= 0 && nextY < 21 && maze[nextY] && maze[nextY][nextX] !== 1) {
        newPacman.direction = inputDirection;
      }
    }
  }
  
  // Move in current direction
  if (newPacman.direction !== 'NONE') {
    const direction = DIRECTIONS[newPacman.direction];
    const newX = newPacman.position.x + direction.x * newPacman.speed;
    const newY = newPacman.position.y + direction.y * newPacman.speed;
    
    // Check collision for movement
    const nextGridX = pixelToGrid(newX);
    const nextGridY = pixelToGrid(newY);
    
    // Handle tunnel wrapping
    let wrappedGridX = nextGridX;
    if (nextGridX < 0) wrappedGridX = 18;
    else if (nextGridX >= 19) wrappedGridX = 0;
    
    // Check if next position is valid
    let canMove = true;
    if (nextGridY < 0 || nextGridY >= 21 || !maze[nextGridY] || maze[nextGridY][wrappedGridX] === 1) {
      canMove = false;
    }
    
    if (canMove) {
      newPacman.position = handleTunnelWrap({ x: newX, y: newY });
    } else {
      // Stop at wall - snap to grid center
      newPacman.position.x = pixelToGrid(newPacman.position.x) * GRID_SIZE;
      newPacman.position.y = pixelToGrid(newPacman.position.y) * GRID_SIZE;
      newPacman.direction = 'NONE';
    }
  }
  
  return {
    ...state,
    pacman: newPacman
  };
};

const updateGhosts = (state: PacmanGameState): PacmanGameState => {
  let newState = { ...state };
  
  // Update global ghost mode timing
  newState = updateGlobalGhostMode(newState);
  
  const newGhosts = state.ghosts.map(ghost => {
    let newGhost = { ...ghost };
    
    // Update ghost mode based on global state and power pellet
    newGhost = updateGhostMode(newGhost, newState.currentGhostMode, newState.powerPelletActive);
    
    // Update scared timer
    if (newGhost.scaredTimer > 0) {
      newGhost.scaredTimer -= 16; // Assuming 60fps, ~16ms per frame
      if (newGhost.scaredTimer <= 0) {
        newGhost.mode = newState.currentGhostMode === 'scatter' ? GHOST_MODES.SCATTER : GHOST_MODES.CHASE;
        newGhost.speed = GHOST_SPEED; // Reset to normal speed
      }
    }
    
    // Handle ghost house exit
    if (newGhost.inHouse && shouldExitHouse(newGhost, newState.gameTime)) {
      newGhost.inHouse = false;
      const exitPos = getGhostHouseExit();
      newGhost.position = { x: gridToPixel(exitPos.x), y: gridToPixel(exitPos.y) };
      newGhost.direction = 'UP';
    }
    
    // Handle return to house after being eaten
    if (newGhost.mode === GHOST_MODES.EATEN && hasReturnedToHouse(newGhost)) {
      newGhost.mode = newState.currentGhostMode === 'scatter' ? GHOST_MODES.SCATTER : GHOST_MODES.CHASE;
      newGhost.speed = GHOST_SPEED;
      newGhost.inHouse = false; // Don't trap them in house
    }
    
    // Update AI behavior and movement
    if (!newGhost.inHouse) {
      newGhost = updateGhostAI(newGhost, newState.pacman, newState.maze, newState.ghosts);
      newGhost = moveGhost(newGhost, newState.maze);
    }
    
    return newGhost;
  });
  
  return {
    ...newState,
    ghosts: newGhosts
  };
};

/**
 * Update global ghost mode (scatter/chase cycling)
 */
const updateGlobalGhostMode = (state: PacmanGameState): PacmanGameState => {
  let newState = { ...state };
  
  // Don't update mode timing during power pellet
  if (state.powerPelletActive) {
    return newState;
  }
  
  newState.ghostModeTimer += 16; // ~16ms per frame at 60fps
  
  const isScatterMode = newState.currentGhostMode === 'scatter';
  const modeTime = isScatterMode ? GHOST_SCATTER_TIME : GHOST_CHASE_TIME;
  
  if (newState.ghostModeTimer >= modeTime) {
    newState.currentGhostMode = isScatterMode ? 'chase' : 'scatter';
    newState.ghostModeTimer = 0;
    
    // Force direction change for all ghosts when mode switches
    newState.ghosts = newState.ghosts.map(ghost => ({
      ...ghost,
      // Reverse direction to prevent getting stuck
      direction: getReverseDirection(ghost.direction)
    }));
  }
  
  return newState;
};

/**
 * Get reverse direction
 */
const getReverseDirection = (direction: string): string => {
  const reverseMap: { [key: string]: string } = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT'
  };
  return reverseMap[direction] || direction;
};

/**
 * Move individual ghost based on AI decision
 */
const moveGhost = (ghost: any, maze: number[][]) => {
  const direction = DIRECTIONS[ghost.direction];
  if (!direction) return ghost;
  
  const newX = ghost.position.x + direction.x * ghost.speed;
  const newY = ghost.position.y + direction.y * ghost.speed;
  
  const collision = checkCollision(maze, ghost.position, newX, newY);
  
  if (!collision.collision) {
    ghost.position = handleTunnelWrap({ x: newX, y: newY });
  }
  // If collision, the AI will choose a new direction on the next update
  
  return ghost;
};

const eatDot = (state: PacmanGameState, position: Position): PacmanGameState => {
  const newMaze = state.maze.map(row => [...row]);
  newMaze[position.y][position.x] = 0; // Remove dot
  
  const newScore = state.score + SCORES.DOT;
  const newDotsRemaining = state.dotsRemaining - 1;
  
  // Play sound effect
  if (state.soundEnabled) {
    soundManager.playSound('dot');
  }
  
  // Check for level completion
  if (newDotsRemaining === 0) {
    if (state.soundEnabled) {
      soundManager.playSound('levelComplete');
    }
    return {
      ...state,
      maze: newMaze,
      score: newScore,
      dotsRemaining: newDotsRemaining,
      gameState: GAME_STATES.LEVEL_COMPLETE
    };
  }
  
  return {
    ...state,
    maze: newMaze,
    score: newScore,
    dotsRemaining: newDotsRemaining
  };
};

const eatPowerPellet = (state: PacmanGameState, position: Position): PacmanGameState => {
  const newMaze = state.maze.map(row => [...row]);
  newMaze[position.y][position.x] = 0; // Remove power pellet
  
  // Play sound effect
  if (state.soundEnabled) {
    soundManager.playSound('powerPellet');
  }
  
  // Make all ghosts scared (except those already eaten)
  const newGhosts = state.ghosts.map(ghost => {
    if (ghost.mode === GHOST_MODES.EATEN) {
      return ghost; // Don't affect eaten ghosts
    }
    
    return {
      ...ghost,
      mode: GHOST_MODES.SCARED,
      scaredTimer: POWER_PELLET_DURATION,
      speed: GHOST_SCARED_SPEED,
      // Reverse direction when becoming scared
      direction: getReverseDirection(ghost.direction)
    };
  });
  
  return {
    ...state,
    maze: newMaze,
    score: state.score + SCORES.POWER_PELLET,
    dotsRemaining: state.dotsRemaining - 1,
    ghosts: newGhosts,
    powerPelletActive: true,
    powerPelletTimer: POWER_PELLET_DURATION,
    ghostEatenCount: 0 // Reset for progressive scoring
  };
};

const eatGhost = (state: PacmanGameState, ghostId: string): PacmanGameState => {
  const score = SCORES.GHOST[Math.min(state.ghostEatenCount, SCORES.GHOST.length - 1)];
  
  // Play sound effect
  if (state.soundEnabled) {
    soundManager.playSound('eatGhost');
  }
  
  const newGhosts = state.ghosts.map(ghost => {
    if (ghost.id === ghostId) {
      return {
        ...ghost,
        mode: GHOST_MODES.EATEN,
        speed: GHOST_SPEED * 1.5, // Faster return to house
        scaredTimer: 0
      };
    }
    return ghost;
  });
  
  return {
    ...state,
    ghosts: newGhosts,
    score: state.score + score,
    ghostEatenCount: state.ghostEatenCount + 1
  };
};

const loseLife = (state: PacmanGameState): PacmanGameState => {
  const newLives = state.lives - 1;
  
  // Play death sound
  if (state.soundEnabled) {
    soundManager.playSound('death');
  }
  
  if (newLives <= 0) {
    // Game over
    const newHighScore = Math.max(state.score, state.highScore);
    localStorage.setItem('pacman-high-score', newHighScore.toString());
    
    return {
      ...state,
      lives: 0,
      highScore: newHighScore,
      gameState: GAME_STATES.GAME_OVER
    };
  }
  
  // Reset positions but keep score and level
  return {
    ...resetGameEntities(state),
    lives: newLives,
    gameState: GAME_STATES.PLAYING
  };
};

const updateGameTime = (state: PacmanGameState, deltaTime: number): PacmanGameState => {
  let newState = {
    ...state,
    gameTime: state.gameTime + deltaTime
  };
  
  // Update power pellet timer
  if (newState.powerPelletActive && newState.powerPelletTimer > 0) {
    newState.powerPelletTimer -= deltaTime;
    if (newState.powerPelletTimer <= 0) {
      newState.powerPelletActive = false;
      // Reset ghost modes and speeds
      newState.ghosts = newState.ghosts.map(ghost => {
        if (ghost.mode === GHOST_MODES.SCARED) {
          return {
            ...ghost,
            mode: newState.currentGhostMode === 'scatter' ? GHOST_MODES.SCATTER : GHOST_MODES.CHASE,
            scaredTimer: 0,
            speed: GHOST_SPEED
          };
        }
        return ghost;
      });
    }
  }
  
  return newState;
};
