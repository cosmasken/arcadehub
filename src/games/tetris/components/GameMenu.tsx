import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Play, RotateCcw, Home, Settings, Award, ShoppingCart, X } from 'lucide-react';
import useWalletStore from '../../../stores/useWalletStore';
import { cn } from '../../../lib/utils';

type TabType = 'main' | 'achievements' | 'upgrades' | 'settings';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  purchased: boolean;
  icon: string;
  effect: string;
}

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center p-2 rounded-lg transition-colors',
      active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
    )}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

interface GameMenuProps {
  type: 'start' | 'pause' | 'gameOver' | null;
  score: number;
  highScore: number;
  level?: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  type,
  score,
  highScore,
  level = 1,
  onStart,
  onResume,
  onRestart,
  onQuit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const { isConnected, connect } = useWalletStore();
  const [coins, setCoins] = useState(100); // Example coin balance
  
  // Example achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_10_lines',
      title: 'Line Master',
      description: 'Clear 10 lines',
      unlocked: false,
      icon: '🏆'
    },
    {
      id: 'first_100_points',
      title: 'Centurion',
      description: 'Score 100 points',
      unlocked: false,
      icon: '🎯'
    },
    {
      id: 'clear_4_lines',
      title: 'Tetris Pro',
      description: 'Clear 4 lines at once',
      unlocked: false,
      icon: '🧩'
    }
  ]);
  
  // Example upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 'ghost_piece',
      name: 'Ghost Piece',
      description: 'Show where the piece will land',
      price: 50,
      purchased: false,
      icon: '👻',
      effect: 'Shows ghost piece'
    },
    {
      id: 'hold_piece',
      name: 'Hold Piece',
      description: 'Store a piece for later use',
      price: 100,
      purchased: true, // This one is already purchased
      icon: '✋',
      effect: 'Hold one piece'
    },
    {
      id: 'next_3_pieces',
      name: 'Next 3 Pieces',
      description: 'See the next 3 pieces in queue',
      price: 150,
      purchased: false,
      icon: '🔮',
      effect: 'Shows next 3 pieces'
    }
  ]);
  
  if (!type) return null;

  const title = type === 'start' ? 'TETRIS' : 
                type === 'pause' ? 'PAUSED' : 'GAME OVER';
                
  const renderContent = () => {
    switch (activeTab) {
      case 'achievements':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Achievements</h2>
              <button 
                onClick={() => setActiveTab('main')}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${achievement.unlocked ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 bg-gray-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h3 className={`font-medium ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-300">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <span className="ml-auto text-yellow-400">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'upgrades':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Upgrades</h2>
                <p className="text-sm text-gray-400">Coins: <span className="text-yellow-400">{coins}</span></p>
              </div>
              <button 
                onClick={() => setActiveTab('main')}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {upgrades.map((upgrade) => (
                <div 
                  key={upgrade.id}
                  className={`p-3 rounded-lg border ${upgrade.purchased ? 'border-green-500 bg-green-500/10' : 'border-gray-700 bg-gray-800/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${upgrade.purchased ? 'text-green-400' : 'text-white'}`}>
                          {upgrade.name}
                        </h3>
                        {!upgrade.purchased && (
                          <span className="text-yellow-400 text-sm font-mono">{upgrade.price} coins</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{upgrade.description}</p>
                      <p className="text-xs text-blue-300 mt-1">Effect: {upgrade.effect}</p>
                    </div>
                  </div>
                  {!upgrade.purchased && (
                    <button 
                      onClick={() => {
                        if (coins >= upgrade.price) {
                          setUpgrades(prev => prev.map(u => 
                            u.id === upgrade.id ? {...u, purchased: true} : u
                          ));
                          setCoins(prev => prev - upgrade.price);
                        }
                      }}
                      disabled={coins < upgrade.price}
                      className={`mt-2 w-full py-1 rounded text-sm font-medium ${coins >= upgrade.price 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                      {coins >= upgrade.price ? 'Purchase' : 'Not enough coins'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button 
                onClick={() => setActiveTab('main')}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-center py-8">Settings coming soon!</p>
            </div>
          </div>
        );
        
      default:
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-2 font-mono">{title}</h1>
            {(type === 'gameOver' || type === 'pause') && (
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-bold text-white">{score}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">High Score:</span>
                  <span className="font-bold text-yellow-400">{highScore}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">Level:</span>
                  <span className="font-bold text-blue-400">{level}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-3 w-full">
              {getActionButton()}
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <TabButton
                  active={false}
                  onClick={() => setActiveTab('achievements')}
                  icon={<Award size={16} />}
                  label="Achievements"
                />
                {isConnected && (
                  <TabButton
                    active={false}
                    onClick={() => setActiveTab('upgrades')}
                    icon={<ShoppingCart size={16} />}
                    label="Upgrades"
                  />
                )}
                <TabButton
                  active={false}
                  onClick={() => setActiveTab('settings')}
                  icon={<Settings size={16} />}
                  label="Settings"
                />
                <Button 
                  variant="ghost" 
                  className="w-full text-red-400 hover:bg-red-900/50 hover:text-red-300"
                  onClick={onQuit}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Quit to Menu
                </Button>
              </div>
            </div>
          </>
        );
    }
  };

  const handleStartWithConnection = async () => {
    if (!isConnected) {
      try {
        await connect();
        // Auto-start after successful connection
        onStart();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      onStart();
    }
  };

  const getActionButton = () => {
    if (type === 'start') {
      return (
        <Button
          onClick={handleStartWithConnection}
          className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          {isConnected ? 'Start Game' : 'Connect Wallet'}
        </Button>
      );
    } else if (type === 'pause') {
      return (
        <>
          <Button
            onClick={onResume}
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white mb-3"
            size="lg"
          >
            Resume Game
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full py-6 text-lg mb-3"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Restart
          </Button>
        </>
      );
    } else { // gameOver
      return (
        <Button
          onClick={onRestart}
          className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white mb-3"
          size="lg"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
