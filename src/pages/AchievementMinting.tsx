import { Trophy } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
}

const achievements: Achievement[] = [
  {
    id: 1,
    name: "First Achievement",
    description: "Complete your first game",
    image: "achievement-1.png"
  },
  {
    id: 2,
    name: "Game Master",
    description: "Win 10 games in a row",
    image: "achievement-2.png"
  },
  {
    id: 3,
    name: "Daily Player",
    description: "Play every day for a week",
    image: "achievement-3.png"
  }
];

const AchievementMinting = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Achievement Minting</h1>
              <p className="text-muted-foreground">View and mint your achievements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="border border-muted rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={achievement.image} 
                      alt={achievement.name} 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <h3 className="font-medium mb-2">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AchievementMinting;
