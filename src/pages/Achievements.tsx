import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import MintModal from '../components/achievements/MintModal';
import { achievements as achievementsObj } from '../games/data/achievements';

// Replace these with real values from your game/user state
const totalClicks = 1234;
const maxPoints = 56789;
const totalPurchases = 42;

const Achievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintedAchievements, setMintedAchievements] = useState<string[]>([]);

  // Calculate progress/unlocked/completed for each achievement
  const achievementsList = Object.entries(achievementsObj).map(([id, achievement]) => {
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

    const isMinted = mintedAchievements.includes(id);

    return {
      id,
      ...achievement,
      current,
      requirement,
      completed,
      isMinted,
    };
  });

  const handleMintSuccess = (achievement: any, txHash: string) => {
    setMintedAchievements(prev => [...prev, achievement.id]);
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Achievements
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Unlock and mint your gaming achievements as NFTs. Show off your gaming prowess on the blockchain!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementsList.map((achievement) => (
            <Card key={achievement.id} className={`p-3 ${achievement.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{achievement.emoji}</span>
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
                <div className="mt-2 flex flex-col gap-2">
                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    Reward: {achievement.reward ? `${achievement.reward} honey` : "Achievement unlocked!"}
                  </div>
                  {!achievement.isMinted && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setIsModalOpen(true);
                      }}
                    >
                      Mint
                    </Button>
                  )}
                  {achievement.isMinted && (
                    <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      Minted
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      <MintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievement={selectedAchievement}
        onMintSuccess={handleMintSuccess}
      />
    </div>
  );
};

export default Achievements;