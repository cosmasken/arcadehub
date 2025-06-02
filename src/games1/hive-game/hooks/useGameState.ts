
import { useState, useEffect } from "react";
import { shopItems } from "../data/shopItems";

interface GameState {
  points: number;
  maxPoints: number;
  totalClicks: number;
  ownedItems: Record<string, number>;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('honeyClickerSave');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          points: 0,
          maxPoints: 0,
          totalClicks: 0,
          ownedItems: {}
        };
      }
    }
    return {
      points: 0,
      maxPoints: 0,
      totalClicks: 0,
      ownedItems: {}
    };
  });

  // Calculate derived values
  const clickMultiplier = 1 + Object.entries(gameState.ownedItems).reduce((total, [itemId, count]) => {
    const item = shopItems.find(i => i.id === itemId);
    return total + (item ? item.clickMultiplier * count : 0);
  }, 0);

  const pointsPerSecond = Object.entries(gameState.ownedItems).reduce((total, [itemId, count]) => {
    const item = shopItems.find(i => i.id === itemId);
    return total + (item ? item.passiveIncome * count : 0);
  }, 0);

  // Auto-save game state
  useEffect(() => {
    localStorage.setItem('honeyClickerSave', JSON.stringify(gameState));
  }, [gameState]);

  // Passive income tick
  useEffect(() => {
    if (pointsPerSecond > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          points: prev.points + pointsPerSecond / 10, // Update 10 times per second for smoothness
          maxPoints: Math.max(prev.maxPoints, prev.points + pointsPerSecond / 10)
        }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [pointsPerSecond]);

  const addPoints = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      points: prev.points + amount,
      maxPoints: Math.max(prev.maxPoints, prev.points + amount),
      totalClicks: prev.totalClicks + 1
    }));
  };

  const canAfford = (itemId: string): boolean => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;
    
    const owned = gameState.ownedItems[itemId] || 0;
    const cost = Math.floor(item.baseCost * Math.pow(1.15, owned));
    return gameState.points >= cost;
  };

  const buyItem = (itemId: string): boolean => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || !canAfford(itemId)) return false;

    const owned = gameState.ownedItems[itemId] || 0;
    const cost = Math.floor(item.baseCost * Math.pow(1.15, owned));

    setGameState(prev => ({
      ...prev,
      points: prev.points - cost,
      ownedItems: {
        ...prev.ownedItems,
        [itemId]: (prev.ownedItems[itemId] || 0) + 1
      }
    }));

    return true;
  };

  return {
    points: gameState.points,
    maxPoints: gameState.maxPoints,
    totalClicks: gameState.totalClicks,
    clickMultiplier,
    pointsPerSecond,
    ownedItems: gameState.ownedItems,
    addPoints,
    buyItem,
    canAfford
  };
};
