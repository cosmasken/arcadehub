import { Position, PathNode } from '../types';
import { MAZE_WIDTH, MAZE_HEIGHT, DIRECTIONS } from '../constants';
import { canMoveTo, getManhattanDistance } from './collision';

/**
 * A* pathfinding algorithm for ghost navigation
 */
export const findPath = (
  maze: number[][],
  start: Position,
  goal: Position,
  maxNodes: number = 100
): Position[] => {
  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();
  
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: getManhattanDistance(start, goal),
    f: 0
  };
  startNode.f = startNode.g + startNode.h;
  
  openSet.push(startNode);
  let nodesProcessed = 0;
  
  while (openSet.length > 0 && nodesProcessed < maxNodes) {
    nodesProcessed++;
    
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openSet.splice(currentIndex, 1)[0];
    const currentKey = `${current.x},${current.y}`;
    closedSet.add(currentKey);
    
    // Check if we reached the goal
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current);
    }
    
    // Check all neighbors
    const neighbors = getNeighbors(maze, current);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      const tentativeG = current.g + 1;
      
      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      
      if (!existingNode) {
        neighbor.g = tentativeG;
        neighbor.h = getManhattanDistance(neighbor, goal);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
        openSet.push(neighbor);
      } else if (tentativeG < existingNode.g) {
        existingNode.g = tentativeG;
        existingNode.f = existingNode.g + existingNode.h;
        existingNode.parent = current;
      }
    }
  }
  
  // No path found, return empty array
  return [];
};

/**
 * Get valid neighboring positions for pathfinding
 */
const getNeighbors = (maze: number[][], node: PathNode): PathNode[] => {
  const neighbors: PathNode[] = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }   // Right
  ];
  
  for (const dir of directions) {
    const newX = node.x + dir.x;
    const newY = node.y + dir.y;
    
    // Handle tunnel wrapping
    let wrappedX = newX;
    if (newX < 0) wrappedX = MAZE_WIDTH - 1;
    else if (newX >= MAZE_WIDTH) wrappedX = 0;
    
    if (canMoveTo(maze, wrappedX, newY)) {
      neighbors.push({
        x: wrappedX,
        y: newY,
        g: 0,
        h: 0,
        f: 0
      });
    }
  }
  
  return neighbors;
};

/**
 * Reconstruct the path from goal to start
 */
const reconstructPath = (node: PathNode): Position[] => {
  const path: Position[] = [];
  let current: PathNode | undefined = node;
  
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
};

/**
 * Get the best direction to move toward a target
 */
export const getDirectionToTarget = (
  maze: number[][],
  from: Position,
  to: Position,
  currentDirection: string
): string => {
  const path = findPath(maze, from, to, 50);
  
  if (path.length > 1) {
    const nextStep = path[1]; // Skip current position
    const dx = nextStep.x - from.x;
    const dy = nextStep.y - from.y;
    
    // Handle tunnel wrapping
    if (Math.abs(dx) > 1) {
      return dx > 0 ? 'LEFT' : 'RIGHT';
    }
    
    if (dx > 0) return 'RIGHT';
    if (dx < 0) return 'LEFT';
    if (dy > 0) return 'DOWN';
    if (dy < 0) return 'UP';
  }
  
  // Fallback: choose best available direction
  return getBestAvailableDirection(maze, from, to, currentDirection);
};

/**
 * Get the best available direction when pathfinding fails
 */
const getBestAvailableDirection = (
  maze: number[][],
  from: Position,
  to: Position,
  currentDirection: string
): string => {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirections: { dir: string; distance: number }[] = [];
  
  for (const dir of directions) {
    const delta = DIRECTIONS[dir as keyof typeof DIRECTIONS];
    const newX = from.x + delta.x;
    const newY = from.y + delta.y;
    
    // Handle tunnel wrapping
    let wrappedX = newX;
    if (newX < 0) wrappedX = MAZE_WIDTH - 1;
    else if (newX >= MAZE_WIDTH) wrappedX = 0;
    
    if (canMoveTo(maze, wrappedX, newY)) {
      const distance = getManhattanDistance({ x: wrappedX, y: newY }, to);
      validDirections.push({ dir, distance });
    }
  }
  
  if (validDirections.length === 0) {
    return currentDirection; // Keep current direction if no valid moves
  }
  
  // Sort by distance and prefer current direction if it's valid
  validDirections.sort((a, b) => a.distance - b.distance);
  
  // Prefer continuing in the same direction if it's among the best options
  const bestDistance = validDirections[0].distance;
  const bestDirections = validDirections.filter(d => d.distance === bestDistance);
  const currentInBest = bestDirections.find(d => d.dir === currentDirection);
  
  return currentInBest ? currentDirection : bestDirections[0].dir;
};

/**
 * Get direction away from a target (for fleeing)
 */
export const getDirectionAwayFromTarget = (
  maze: number[][],
  from: Position,
  target: Position,
  currentDirection: string
): string => {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirections: { dir: string; distance: number }[] = [];
  
  for (const dir of directions) {
    const delta = DIRECTIONS[dir as keyof typeof DIRECTIONS];
    const newX = from.x + delta.x;
    const newY = from.y + delta.y;
    
    // Handle tunnel wrapping
    let wrappedX = newX;
    if (newX < 0) wrappedX = MAZE_WIDTH - 1;
    else if (newX >= MAZE_WIDTH) wrappedX = 0;
    
    if (canMoveTo(maze, wrappedX, newY)) {
      const distance = getManhattanDistance({ x: wrappedX, y: newY }, target);
      validDirections.push({ dir, distance });
    }
  }
  
  if (validDirections.length === 0) {
    return currentDirection;
  }
  
  // Sort by distance (descending - we want maximum distance)
  validDirections.sort((a, b) => b.distance - a.distance);
  
  return validDirections[0].dir;
};

/**
 * Check if position is at an intersection (more than 2 valid directions)
 */
export const isAtIntersection = (maze: number[][], position: Position): boolean => {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  let validCount = 0;
  
  for (const dir of directions) {
    const delta = DIRECTIONS[dir as keyof typeof DIRECTIONS];
    const newX = position.x + delta.x;
    const newY = position.y + delta.y;
    
    // Handle tunnel wrapping
    let wrappedX = newX;
    if (newX < 0) wrappedX = MAZE_WIDTH - 1;
    else if (newX >= MAZE_WIDTH) wrappedX = 0;
    
    if (canMoveTo(maze, wrappedX, newY)) {
      validCount++;
    }
  }
  
  return validCount > 2;
};

/**
 * Get random valid direction (for unpredictable movement)
 */
export const getRandomValidDirection = (
  maze: number[][],
  position: Position,
  excludeOpposite: boolean = true,
  currentDirection: string = 'NONE'
): string => {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirections: string[] = [];
  
  // Get opposite direction to potentially exclude
  const opposites: { [key: string]: string } = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT'
  };
  
  const oppositeDir = opposites[currentDirection];
  
  for (const dir of directions) {
    if (excludeOpposite && dir === oppositeDir) {
      continue; // Skip opposite direction
    }
    
    const delta = DIRECTIONS[dir as keyof typeof DIRECTIONS];
    const newX = position.x + delta.x;
    const newY = position.y + delta.y;
    
    // Handle tunnel wrapping
    let wrappedX = newX;
    if (newX < 0) wrappedX = MAZE_WIDTH - 1;
    else if (newX >= MAZE_WIDTH) wrappedX = 0;
    
    if (canMoveTo(maze, wrappedX, newY)) {
      validDirections.push(dir);
    }
  }
  
  if (validDirections.length === 0) {
    // If no valid directions (shouldn't happen), try including opposite
    return getRandomValidDirection(maze, position, false, currentDirection);
  }
  
  return validDirections[Math.floor(Math.random() * validDirections.length)];
};
