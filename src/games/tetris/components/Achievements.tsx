import React from 'react';
import { useGame } from '../context';
import { ACHIEVEMENTS } from '../constants';

const Achievements: React.FC = () => {
  const { state } = useGame();
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => 
    state.stats.achievements.includes(achievement.id)
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Achievements</h3>
      <div className="space-y-2">
        {unlockedAchievements.length > 0 ? (
          unlockedAchievements.map((achievement) => (
            <div key={achievement.id} className="bg-gray-700 p-3 rounded flex items-center">
              <div className="bg-yellow-500 text-white p-2 rounded-full mr-3">
                {achievement.icon}
              </div>
              <div>
                <h4 className="font-bold">{achievement.name}</h4>
                <p className="text-sm text-gray-300">{achievement.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">
            No achievements unlocked yet. Keep playing!
          </p>
        )}
      </div>
    </div>
  );
};

export default Achievements;
