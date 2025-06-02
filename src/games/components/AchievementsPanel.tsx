
import React from 'react';
import { Card } from '@/components/ui/card';
import { achievements, Achievement } from '../data/achievements';

interface AchievementsPanelProps {
  totalClicks: number;
  maxPoints: number;
  totalPurchases: number;
}

export const AchievementsPanel = ({ totalClicks, maxPoints, totalPurchases }: AchievementsPanelProps) => {
  // Convert achievements object to array with completion status
  const achievementsList = Object.entries(achievements).map(([id, achievement]: [string, Achievement]) => {
    let current = 0;
    let requirement = 0;
    let completed = false;

    if (achievement.requirement) {
      current = Math.floor(maxPoints);
      requirement = achievement.requirement;
      completed = maxPoints >= achievement.requirement;
    } else if (achievement.clicksRequired) {
      current = totalClicks;
      requirement = achievement.clicksRequired;
      completed = totalClicks >= achievement.clicksRequired;
    } else if (achievement.purchasesRequired) {
      current = totalPurchases;
      requirement = achievement.purchasesRequired;
      completed = totalPurchases >= achievement.purchasesRequired;
    }

    return {
      id,
      title: achievement.name,
      description: achievement.description,
      longDescription: achievement.longDescription,
      icon: achievement.emoji,
      requirement,
      current,
      completed,
      reward: achievement.reward ? `${achievement.reward} honey` : "Achievement unlocked!"
    };
  });

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-800">🏆 Achievements</h2>
      <div className="space-y-2">
        {achievementsList.map((achievement) => (
          <Card key={achievement.id} className={`p-3 ${achievement.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <h3 className={`font-semibold ${achievement.completed ? 'text-green-800' : 'text-gray-800'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {achievement.current} / {achievement.requirement}
                  </span>
                  {achievement.completed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Completed! 🎉
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{
                      width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
            {achievement.completed && (
              <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
                Reward: {achievement.reward}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
