import { SpriteConfig, SnakeSprites } from './SpriteRenderer';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeSegmentSprite {
  sprite: SpriteConfig;
  rotation?: number; // Rotation in degrees
}

/**
 * Determines which sprite to use for a snake segment based on its position
 * in the snake and the segments around it
 */
export function getSegmentSprite(
  segments: SnakeSegment[],
  index: number,
  sprites: SnakeSprites
): SnakeSegmentSprite {
  const current = segments[index];
  const prev = index > 0 ? segments[index - 1] : null;
  const next = index < segments.length - 1 ? segments[index + 1] : null;

  // Head segment
  if (index === 0) {
    if (!next) {
      return { sprite: sprites.head.up }; // Single segment
    }

    // Determine head direction based on next segment
    const dx = current.x - next.x;
    const dy = current.y - next.y;

    if (dx > 0) return { sprite: sprites.head.right };
    if (dx < 0) return { sprite: sprites.head.left };
    if (dy > 0) return { sprite: sprites.head.down };
    return { sprite: sprites.head.up };
  }

  // Tail segment
  if (index === segments.length - 1) {
    if (!prev) {
      return { sprite: sprites.tail.up }; // Single segment (shouldn't happen)
    }

    // Determine tail direction based on previous segment
    const dx = prev.x - current.x;
    const dy = prev.y - current.y;

    if (dx > 0) return { sprite: sprites.tail.right };
    if (dx < 0) return { sprite: sprites.tail.left };
    if (dy > 0) return { sprite: sprites.tail.down };
    return { sprite: sprites.tail.up };
  }

  // Body segment
  if (!prev || !next) {
    return { sprite: sprites.body.horizontal }; // Fallback
  }

  const prevDx = prev.x - current.x;
  const prevDy = prev.y - current.y;
  const nextDx = next.x - current.x;
  const nextDy = next.y - current.y;

  // Straight segments
  if ((prevDx === 0 && nextDx === 0) || (prevDx === 0 && nextDx === 0)) {
    return { sprite: sprites.body.vertical };
  }
  if ((prevDy === 0 && nextDy === 0) || (prevDy === 0 && nextDy === 0)) {
    return { sprite: sprites.body.horizontal };
  }

  // Corner segments
  if ((prevDx === -1 && nextDy === -1) || (prevDy === -1 && nextDx === -1)) {
    return { sprite: sprites.body.cornerTopLeft };
  }
  if ((prevDx === 1 && nextDy === -1) || (prevDy === -1 && nextDx === 1)) {
    return { sprite: sprites.body.cornerTopRight };
  }
  if ((prevDx === -1 && nextDy === 1) || (prevDy === 1 && nextDx === -1)) {
    return { sprite: sprites.body.cornerBottomLeft };
  }
  if ((prevDx === 1 && nextDy === 1) || (prevDy === 1 && nextDx === 1)) {
    return { sprite: sprites.body.cornerBottomRight };
  }

  // Default to horizontal body
  return { sprite: sprites.body.horizontal };
}

/**
 * Gets the direction from one segment to another
 */
export function getDirection(from: SnakeSegment, to: SnakeSegment): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx > 0) return 'RIGHT';
  if (dx < 0) return 'LEFT';
  if (dy > 0) return 'DOWN';
  return 'UP';
}
