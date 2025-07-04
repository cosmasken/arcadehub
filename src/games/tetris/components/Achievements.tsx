import React, { useState } from 'react';
import { useGame } from '../context';
import { ACHIEVEMENTS } from '../constants';
import { cn } from '../../../lib/utils';

type TabType = 'all' | 'unlocked' | 'locked';

const Achievements: React.FC = () => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const isUnlocked = state.stats.achievements.includes(achievement.id);
    if (activeTab === 'unlocked') return isUnlocked;
    if (activeTab === 'locked') return !isUnlocked;
    return true;
  });

  const totalUnlocked = state.stats.achievements.length;
  const progressPercentage = (totalUnlocked / ACHIEVEMENTS.length) * 100;

  return (
    <div className="bg-gray-900/95 p-6 rounded-lg">
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200',
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unlocked')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200',
            activeTab === 'unlocked'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          )}
        >
          Unlocked
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200',
            activeTab === 'locked'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          )}
        >
          Locked
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const isUnlocked = state.stats.achievements.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200',
                  isUnlocked
                    ? 'bg-green-900/20 border-green-500/30 text-green-400'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                )}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-2xl mr-3">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {achievement.name}
                    </h3>
                    <p className="text-sm opacity-80">
                      {achievement.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-yellow-500 font-bold">
                      +{achievement.reward} 🪙
                    </div>
                    {isUnlocked && (
                      <div className="text-green-400 text-sm mt-1">
                        Unlocked ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No achievements found in this category
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-gray-400">
            {totalUnlocked} / {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default Achievements;
