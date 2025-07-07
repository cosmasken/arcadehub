import { Position, GhostEntity, PacmanEntity } from '../types';
import { SCATTER_TARGETS, DIRECTIONS, GHOST_MODES } from '../constants';
import { 
  getDirectionToTarget, 
  getDirectionAwayFromTarget, 
  isAtIntersection,
  getRandomValidDirection 
} from './pathfinding';
import { pixelToGrid, gridToPixel, getManhattanDistance } from './collision';

/**
 * Update ghost AI behavior based on individual personality
 */
export const updateGhostAI = (
  ghost: GhostEntity,
  pacman: PacmanEntity,
  maze: number[][],
  allGhosts: GhostEntity[]
): GhostEntity => {
  const updatedGhost = { ...ghost };
  
  // Convert pixel positions to grid positions for AI calculations
  const ghostGridPos = {
    x: pixelToGrid(ghost.position.x),
    y: pixelToGrid(ghost.position.y)
  };
  
  const pacmanGridPos = {
    x: pixelToGrid(pacman.position.x),
    y: pixelToGrid(pacman.position.y)
  };
  
  // Determine target based on ghost mode and personality
  let target: Position;
  
  switch (ghost.mode) {
    case GHOST_MODES.SCATTER:
      target = getScatterTarget(ghost.id);
      break;
      
    case GHOST_MODES.CHASE:
      target = getChaseTarget(ghost.id, pacmanGridPos, pacman.direction, allGhosts);
      break;
      
    case GHOST_MODES.SCARED:
      target = getScaredTarget(ghostGridPos, pacmanGridPos);
      break;
      
    case GHOST_MODES.EATEN:
      target = { x: 9, y: 9 }; // Return to ghost house
      break;
      
    default:
      target = ghostGridPos;
  }
  
  updatedGhost.target = target;
  
  // Only change direction at intersections or when hitting walls
  const shouldChangeDirection = isAtIntersection(maze, ghostGridPos) || 
                               !canContinueInDirection(maze, ghostGridPos, ghost.direction);
  
  if (shouldChangeDirection) {
    let newDirection: string;
    
    if (ghost.mode === GHOST_MODES.SCARED) {
      // Scared ghosts move more randomly and try to avoid Pac-Man
      if (Math.random() < 0.7) {
        newDirection = getDirectionAwayFromTarget(maze, ghostGridPos, pacmanGridPos, ghost.direction);
      } else {
        newDirection = getRandomValidDirection(maze, ghostGridPos, true, ghost.direction);
      }
    } else {
      // Normal AI behavior
      newDirection = getDirectionToTarget(maze, ghostGridPos, target, ghost.direction);
    }
    
    updatedGhost.direction = newDirection as any;
  }
  
  return updatedGhost;
};

/**
 * Get scatter target for each ghost (their home corners)
 */
const getScatterTarget = (ghostId: string): Position => {
  return SCATTER_TARGETS[ghostId as keyof typeof SCATTER_TARGETS] || { x: 0, y: 0 };
};

/**
 * Get chase target based on individual ghost personality
 */
const getChaseTarget = (
  ghostId: string,
  pacmanPos: Position,
  pacmanDirection: string,
  allGhosts: GhostEntity[]
): Position => {
  switch (ghostId) {
    case 'BLINKY':
      // Blinky (Red) - Direct chase, targets Pac-Man's current position
      return { ...pacmanPos };
      
    case 'PINKY':
      // Pinky (Pink) - Ambush, targets 4 tiles ahead of Pac-Man
      return getPinkyTarget(pacmanPos, pacmanDirection);
      
    case 'INKY':
      // Inky (Cyan) - Complex behavior, uses Blinky's position
      return getInkyTarget(pacmanPos, pacmanDirection, allGhosts);
      
    case 'CLYDE':
      // Clyde (Orange) - Shy, chases when far, scatters when close
      return getClydeTarget(pacmanPos, allGhosts.find(g => g.id === 'CLYDE'));
      
    default:
      return { ...pacmanPos };
  }
};

/**
 * Pinky's targeting: 4 tiles ahead of Pac-Man in his current direction
 */
const getPinkyTarget = (pacmanPos: Position, pacmanDirection: string): Position => {
  const direction = DIRECTIONS[pacmanDirection as keyof typeof DIRECTIONS] || DIRECTIONS.NONE;
  
  let target = {
    x: pacmanPos.x + (direction.x * 4),
    y: pacmanPos.y + (direction.y * 4)
  };
  
  // Handle the original Pac-Man bug: when Pac-Man faces up, 
  // Pinky targets 4 tiles up and 4 tiles left
  if (pacmanDirection === 'UP') {
    target.x -= 4;
  }
  
  // Clamp to maze boundaries
  target.x = Math.max(0, Math.min(18, target.x));
  target.y = Math.max(0, Math.min(20, target.y));
  
  return target;
};

/**
 * Inky's targeting: Complex calculation using Blinky's position
 */
const getInkyTarget = (
  pacmanPos: Position,
  pacmanDirection: string,
  allGhosts: GhostEntity[]
): Position => {
  const blinky = allGhosts.find(g => g.id === 'BLINKY');
  if (!blinky) return { ...pacmanPos };
  
  const blinkyGridPos = {
    x: pixelToGrid(blinky.position.x),
    y: pixelToGrid(blinky.position.y)
  };
  
  // Get point 2 tiles ahead of Pac-Man
  const direction = DIRECTIONS[pacmanDirection as keyof typeof DIRECTIONS] || DIRECTIONS.NONE;
  const intermediatePoint = {
    x: pacmanPos.x + (direction.x * 2),
    y: pacmanPos.y + (direction.y * 2)
  };
  
  // Apply the same up-direction bug as Pinky
  if (pacmanDirection === 'UP') {
    intermediatePoint.x -= 2;
  }
  
  // Calculate vector from Blinky to intermediate point and double it
  const vectorX = intermediatePoint.x - blinkyGridPos.x;
  const vectorY = intermediatePoint.y - blinkyGridPos.y;
  
  const target = {
    x: blinkyGridPos.x + (vectorX * 2),
    y: blinkyGridPos.y + (vectorY * 2)
  };
  
  // Clamp to maze boundaries
  target.x = Math.max(0, Math.min(18, target.x));
  target.y = Math.max(0, Math.min(20, target.y));
  
  return target;
};

/**
 * Clyde's targeting: Chase when far (>8 tiles), scatter when close
 */
const getClydeTarget = (pacmanPos: Position, clyde?: GhostEntity): Position => {
  if (!clyde) return { ...pacmanPos };
  
  const clydeGridPos = {
    x: pixelToGrid(clyde.position.x),
    y: pixelToGrid(clyde.position.y)
  };
  
  const distance = getManhattanDistance(clydeGridPos, pacmanPos);
  
  if (distance > 8) {
    // Far from Pac-Man: chase directly
    return { ...pacmanPos };
  } else {
    // Close to Pac-Man: retreat to scatter corner
    return SCATTER_TARGETS.CLYDE;
  }
};

/**
 * Get scared target (try to avoid Pac-Man)
 */
const getScaredTarget = (ghostPos: Position, pacmanPos: Position): Position => {
  // Try to get as far away as possible
  const dx = ghostPos.x - pacmanPos.x;
  const dy = ghostPos.y - pacmanPos.y;
  
  // Amplify the distance vector
  const target = {
    x: ghostPos.x + dx * 2,
    y: ghostPos.y + dy * 2
  };
  
  // Clamp to maze boundaries
  target.x = Math.max(0, Math.min(18, target.x));
  target.y = Math.max(0, Math.min(20, target.y));
  
  return target;
};

/**
 * Check if ghost can continue in current direction
 */
const canContinueInDirection = (maze: number[][], position: Position, direction: string): boolean => {
  const delta = DIRECTIONS[direction as keyof typeof DIRECTIONS];
  if (!delta) return false;
  
  const newX = position.x + delta.x;
  const newY = position.y + delta.y;
  
  // Handle tunnel wrapping
  let wrappedX = newX;
  if (newX < 0) wrappedX = 18;
  else if (newX >= 19) wrappedX = 0;
  
  // Check if the new position is valid
  if (wrappedX < 0 || wrappedX >= 19 || newY < 0 || newY >= 21) {
    return false;
  }
  
  return maze[newY][wrappedX] !== 1; // Not a wall
};

/**
 * Get ghost house exit position
 */
export const getGhostHouseExit = (): Position => {
  return { x: 9, y: 8 }; // Exit position above ghost house
};

/**
 * Check if ghost should exit the house
 */
export const shouldExitHouse = (ghost: GhostEntity, gameTime: number): boolean => {
  if (!ghost.inHouse) return false;
  
  // Different exit timers for each ghost
  const exitTimes: { [key: string]: number } = {
    'BLINKY': 0,    // Starts outside
    'PINKY': 1000,  // 1 second
    'INKY': 3000,   // 3 seconds
    'CLYDE': 5000   // 5 seconds
  };
  
  return gameTime >= (exitTimes[ghost.id] || 0);
};

/**
 * Update ghost mode based on game state and timers
 */
export const updateGhostMode = (
  ghost: GhostEntity,
  currentGlobalMode: 'scatter' | 'chase',
  powerPelletActive: boolean
): GhostEntity => {
  const updatedGhost = { ...ghost };
  
  if (powerPelletActive && ghost.mode !== GHOST_MODES.EATEN) {
    updatedGhost.mode = GHOST_MODES.SCARED;
  } else if (ghost.mode === GHOST_MODES.SCARED && !powerPelletActive) {
    // Return to global mode when power pellet wears off
    updatedGhost.mode = currentGlobalMode === 'scatter' ? GHOST_MODES.SCATTER : GHOST_MODES.CHASE;
  } else if (ghost.mode !== GHOST_MODES.SCARED && ghost.mode !== GHOST_MODES.EATEN) {
    // Follow global mode
    updatedGhost.mode = currentGlobalMode === 'scatter' ? GHOST_MODES.SCATTER : GHOST_MODES.CHASE;
  }
  
  return updatedGhost;
};

/**
 * Check if ghost has returned to house after being eaten
 */
export const hasReturnedToHouse = (ghost: GhostEntity): boolean => {
  if (ghost.mode !== GHOST_MODES.EATEN) return false;
  
  const ghostGridPos = {
    x: pixelToGrid(ghost.position.x),
    y: pixelToGrid(ghost.position.y)
  };
  
  // Check if ghost is back in the house area
  return ghostGridPos.x >= 8 && ghostGridPos.x <= 10 && 
         ghostGridPos.y >= 9 && ghostGridPos.y <= 11;
};
