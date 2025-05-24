import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Gamepad2 } from 'lucide-react';
import MintModal from '../components/achievements/MintModal';

// Mock achievements data
const achievementsData = [
  {
    id: 1,
    title: 'Played 100 Games',
    description: 'Complete 100 games across any genre',
    icon: Gamepad2,
    isUnlocked: true,
    progress: 100,
    maxProgress: 100,
    rarity: 'Common',
    isMinted: false
  },
  {
    id: 2,
    title: 'High Scorer',
    description: 'Achieve a score above 10,000 points',
    icon: Star,
    isUnlocked: true,
    progress: 1,
    maxProgress: 1,
    rarity: 'Rare',
    isMinted: false
  },
  {
    id: 3,
    title: 'Speed Demon',
    description: 'Complete a racing game in under 2 minutes',
    icon: Target,
    isUnlocked: false,
    progress: 85,
    maxProgress: 120,
    rarity: 'Epic',
    isMinted: false
  },
  {
    id: 4,
    title: 'Gaming Legend',
    description: 'Unlock all other achievements',
    icon: Trophy,
    isUnlocked: false,
    progress: 2,
    maxProgress: 10,
    rarity: 'Legendary',
    isMinted: false
  }
];

const Achievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMintClick = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleMintSuccess = (achievement, txHash) => {
    console.log(`Achievement ${achievement.title} minted successfully. TX: ${txHash}`);
    // Update achievement as minted in real implementation
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (progress, maxProgress) => {
    return Math.min((progress / maxProgress) * 100, 100);
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
          {achievementsData.map((achievement) => {
            const IconComponent = achievement.icon;
            const progressPercentage = getProgressPercentage(achievement.progress, achievement.maxProgress);
            
            return (
              <Card 
                key={achievement.id} 
                className={`bg-blue-800/30 border-blue-700/50 text-white transition-all hover:scale-105 ${
                  !achievement.isUnlocked ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${achievement.isUnlocked ? 'bg-blue-600' : 'bg-gray-600'}`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{achievement.title}</h3>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-blue-200 text-sm mb-4">{achievement.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleMintClick(achievement)}
                    disabled={!achievement.isUnlocked || achievement.isMinted}
                    className={`w-full ${
                      achievement.isUnlocked && !achievement.isMinted
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {achievement.isMinted 
                      ? 'Already Minted' 
                      : achievement.isUnlocked 
                        ? 'Mint Achievement' 
                        : 'Locked'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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