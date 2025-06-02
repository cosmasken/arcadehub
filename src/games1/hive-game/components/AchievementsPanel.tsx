
import React from "react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { useToast } from "../../../hooks/use-toast";
import { Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  completed: boolean;
  reward?: string;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  const { toast } = useToast();
  const completedCount = achievements.filter(a => a.completed).length;
  const completedAchievements = achievements.filter(a => a.completed);

  const handleMintAll = () => {
    if (completedAchievements.length === 0) {
      toast({
        title: "No achievements to mint!",
        description: "Complete some achievements first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🎉 Achievements Minted!",
      description: `Successfully minted ${completedAchievements.length} achievement${completedAchievements.length > 1 ? 's' : ''}!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-800">🏆 Achievements</h2>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {completedCount}/{achievements.length}
          </Badge>
          <Button
            onClick={handleMintAll}
            disabled={completedAchievements.length === 0}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Award className="h-4 w-4 mr-2" />
            Mint All ({completedAchievements.length})
          </Button>
        </div>
      </div>

      {completedAchievements.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎖️</div>
            <div>
              <h3 className="font-semibold text-amber-800">Ready to Mint!</h3>
              <p className="text-sm text-amber-600">
                You have {completedAchievements.length} completed achievement{completedAchievements.length > 1 ? 's' : ''} ready to mint as NFTs.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={`p-4 ${achievement.completed ? 'bg-amber-50 border-amber-200' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-amber-800">{achievement.title}</h3>
                  {achievement.completed && (
                    <Badge className="bg-green-500 text-white text-xs">✓</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                
                {!achievement.completed && (
                  <div className="space-y-1">
                    <Progress 
                      value={(achievement.current / achievement.requirement) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {achievement.current}/{achievement.requirement}
                    </div>
                  </div>
                )}

                {achievement.reward && achievement.completed && (
                  <div className="text-xs text-green-600 font-medium">
                    Reward: {achievement.reward}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
