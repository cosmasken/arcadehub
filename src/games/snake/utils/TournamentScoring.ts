import { ScoringMetrics, GameState } from '../types';

export class TournamentScoring {
  /**
   * Calculate enhanced tournament score with time, combo, and skill bonuses
   */
  static calculateTournamentScore(state: GameState): ScoringMetrics {
    const baseScore = state.foodEaten * 10;
    
    // Time bonus - reward faster gameplay
    const gameTimeSeconds = state.gameDuration / 1000;
    const timeBonus = state.gameMode === 'timeAttack' 
      ? Math.max(0, Math.floor((300 - gameTimeSeconds) * 2)) // Bonus for finishing under 5 minutes
      : Math.max(0, Math.floor(state.foodEaten / gameTimeSeconds * 50)); // Points per second efficiency
    
    // Combo bonus - reward consecutive food eating
    const comboBonus = state.maxCombo >= 5 
      ? Math.floor(Math.pow(state.maxCombo, 1.5) * 10)
      : 0;
    
    // Skill bonus - reward perfect moves and near misses
    const skillBonus = state.perfectMoves * 25;
    
    // Calculate multiplier based on game mode and performance
    let multiplier = 1.0;
    if (state.gameMode === 'timeAttack') multiplier = 1.5;
    if (state.gameMode === 'survival') multiplier = 1.3;
    if (state.comboMultiplier > 1) multiplier += (state.comboMultiplier - 1) * 0.1;
    
    const finalScore = Math.floor((baseScore + timeBonus + comboBonus + skillBonus) * multiplier);
    
    return {
      baseScore,
      timeBonus,
      comboBonus,
      skillBonus,
      finalScore,
      multiplier
    };
  }

  /**
   * Generate deterministic food position using game seed
   */
  static generateFoodPosition(seed: string, moveCount: number, gridSize: number): { x: number; y: number } {
    // Simple seeded random using the game seed and move count
    const seedValue = this.hashString(seed + moveCount.toString());
    const x = seedValue % gridSize;
    const y = Math.floor(seedValue / gridSize) % gridSize;
    return { x, y };
  }

  /**
   * Simple hash function for deterministic randomness
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create game state hash for verification
   */
  static createGameStateHash(state: GameState): string {
    const hashData = {
      score: state.score,
      foodEaten: state.foodEaten,
      moveCount: state.moveCount,
      gameDuration: state.gameDuration,
      maxCombo: state.maxCombo,
      seed: state.gameSeed
    };
    return btoa(JSON.stringify(hashData));
  }

  /**
   * Validate if a move is "perfect" (efficient, no backtracking)
   */
  static isPerfectMove(
    currentDirection: string, 
    newDirection: string, 
    snakeLength: number
  ): boolean {
    // Perfect move criteria:
    // 1. No immediate direction reversal
    // 2. Movement toward food (would need food position)
    // 3. No unnecessary moves
    
    const opposites: Record<string, string> = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };
    
    // Basic check: not reversing direction
    return opposites[currentDirection] !== newDirection;
  }

  /**
   * Check if game mode time limit is reached
   */
  static isTimeUp(state: GameState): boolean {
    if (!state.timeLimit) return false;
    return state.gameDuration >= state.timeLimit * 1000;
  }

  /**
   * Check if target score is reached
   */
  static isTargetReached(state: GameState): boolean {
    if (!state.targetScore) return false;
    return state.score >= state.targetScore;
  }
}
