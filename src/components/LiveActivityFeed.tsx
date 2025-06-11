
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  Gamepad2, 
  Users, 
  Zap, 
  Star,
  TrendingUp
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'achievement' | 'highscore' | 'tournament' | 'game_start' | 'streak';
  user: string;
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'highscore',
      user: 'GameMaster_99',
      message: 'achieved new high score of 15,250 in Honey Clicker!',
      timestamp: '2 min ago',
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-yellow-400'
    },
    {
      id: '2',
      type: 'achievement',
      user: 'SpaceAce',
      message: 'unlocked "Destroyer of Worlds" achievement',
      timestamp: '5 min ago',
      icon: <Star className="w-4 h-4" />,
      color: 'text-purple-400'
    },
    {
      id: '3',
      type: 'tournament',
      user: 'RetroGamer',
      message: 'joined the Speed Run Championship',
      timestamp: '8 min ago',
      icon: <Users className="w-4 h-4" />,
      color: 'text-cyan-400'
    },
    {
      id: '4',
      type: 'streak',
      user: 'PixelWarrior',
      message: 'reached a 7-day gaming streak!',
      timestamp: '12 min ago',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-green-400'
    }
  ]);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'game_start',
        user: `Player_${Math.floor(Math.random() * 1000)}`,
        message: 'started playing Space Invaders',
        timestamp: 'just now',
        icon: <Gamepad2 className="w-4 h-4" />,
        color: 'text-blue-400'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="game-card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-bold neon-text">&gt; LIVE_ACTIVITY &lt;</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start space-x-3 p-2 rounded border border-green-400/20 bg-black/30 hover:bg-green-400/5 transition-colors"
          >
            <div className={activity.color}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-green-400 text-sm">
                <span className="text-cyan-400 font-bold">{activity.user}</span>{' '}
                {activity.message}
              </p>
              <p className="text-green-300/60 text-xs">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LiveActivityFeed;
