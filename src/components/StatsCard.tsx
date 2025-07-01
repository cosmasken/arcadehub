
import React from 'react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, trend }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-neon-green';
      case 'down':
        return 'text-neon-pink';
      default:
        return 'text-neon-blue';
    }
  };

  return (
    <Card className="stat-card p-6 transition-all duration-300 hover:scale-105 hover:animate-glow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-arcade text-foreground/70 mb-2 tracking-wider uppercase">
             {title.replace(' ', '_')}
          </p>
          <p className="text-2xl md:text-3xl font-orbitron font-bold text-neon-blue neon-text mb-1">
            {value}
          </p>
          <p className={`text-xs font-orbitron tracking-wider ${getTrendColor()}`}>
            {change.toUpperCase()}
          </p>
        </div>
        <div className="p-4 bg-black/30 rounded border border-neon-purple/30">
          <Icon className="w-6 h-6 text-neon-purple" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
