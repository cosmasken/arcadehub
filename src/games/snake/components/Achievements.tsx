import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { ACHIEVEMENTS } from '../constants';

const Achievements: React.FC = () => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const isUnlocked = state.achievements.includes(achievement.id);
    if (activeTab === 'unlocked') return isUnlocked;
    if (activeTab === 'locked') return !isUnlocked;
    return true;
  });
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Achievements</h2>
      
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1 text-sm rounded-full ${activeTab === 'all' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full ${activeTab === 'unlocked' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('unlocked')}
        >
          Unlocked
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full ${activeTab === 'locked' 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('locked')}
        >
          Locked
        </button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const isUnlocked = state.achievements.includes(achievement.id);
            
            return (
              <div 
                key={achievement.id}
                className={`p-3 rounded ${isUnlocked 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-gray-50 border border-gray-100'}`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    {/* <img 
                      src={achievement.icon} 
                      alt={achievement.name}
                      className={`w-10 h-10 object-contain ${!isUnlocked ? 'opacity-40' : ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/40';
                      }}
                    /> */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">🔒</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <h3 className={`font-medium ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                  
                  {isUnlocked && (
                    <div className="flex items-center">
                      <span className="text-yellow-600 font-medium text-sm">+{achievement.reward} 🪙</span>
                      <span className="ml-2 text-green-500">✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500">
            {activeTab === 'unlocked' 
              ? 'No achievements unlocked yet!' 
              : 'No achievements found'}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t text-center">
        <p className="text-sm text-gray-600">
          {state.achievements.length} of {ACHIEVEMENTS.length} achievements unlocked
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{
              width: `${(state.achievements.length / ACHIEVEMENTS.length) * 100}%`,
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Achievements;
