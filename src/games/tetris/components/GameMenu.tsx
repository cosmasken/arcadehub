import React, { useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Play, RotateCcw, Home, Settings, Award, ShoppingCart, X, HelpCircle } from 'lucide-react';
import useWalletStore from '../../../stores/useWalletStore';
import { cn } from '../../../lib/utils';
import HelpSidebar from './HelpSidebar';

interface ControlSettings {
  moveLeft: string;
  moveRight: string;
  rotate: string;
  softDrop: string;
  hardDrop: string;
  hold: string;
  pause: string;
}

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
  type: 'start' | 'pause' | 'gameOver';
  score: number;
  highScore: number;
  level: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  controls: ControlSettings;
  onControlsChange: (controls: ControlSettings) => void;
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
  const [showHelp, setShowHelp] = useState(false);
  const { isConnected, connect } = useWalletStore();

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

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
  
  // Example controls configuration - should come from game settings
  const [controls, setControls] = useState<ControlSettings>({
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotate: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: ' ',
    hold: 'c',
    pause: 'p'
  });

  const handleControlChange = (control: string, key: string) => {
    setControls(prev => ({
      ...prev,
      [control]: key
    }));
  };

  // Example upgrades data - replace with actual game state
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
                    </div>
                    <div>
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                    </div>
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
              <h3 className="text-lg font-bold text-white">Upgrades</h3>
              <div className="flex items-center bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                🪙 {coins}
              </div>
            </div>
            <div className="space-y-3">
              {upgrades.map((upgrade) => (
                <div
                  key={upgrade.id}
                  className={`p-3 rounded-lg ${
                    upgrade.purchased ? 'bg-green-900/30' : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{upgrade.name}</div>
                      <div className="text-sm text-gray-400">{upgrade.description}</div>
                      <div className="text-xs text-blue-400 mt-1">{upgrade.effect}</div>
                    </div>
                    <Button
                      size="sm"
                      disabled={upgrade.purchased || coins < upgrade.price}
                      onClick={() => {
                        if (coins >= upgrade.price) {
                          setUpgrades(prev =>
                            prev.map(u =>
                              u.id === upgrade.id
                                ? { ...u, purchased: true }
                                : u
                            )
                          );
                          setCoins(prev => prev - upgrade.price);
                        }
                      }}
                      className={`${
                        upgrade.purchased
                          ? 'bg-green-600 hover:bg-green-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {upgrade.purchased ? 'Purchased' : `${upgrade.price} 🪙`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="space-y-3">
                {Object.entries({
                  moveLeft: 'Move Left',
                  moveRight: 'Move Right',
                  rotate: 'Rotate',
                  softDrop: 'Soft Drop',
                  hardDrop: 'Hard Drop',
                  hold: 'Hold Piece',
                  pause: 'Pause'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300">{label}</span>
                    <input
                      type="text"
                      value={controls[key as keyof ControlSettings]}
                      onChange={(e) => handleControlChange(key, e.target.value)}
                      className="w-20 bg-gray-800/50 p-1 rounded text-gray-300 text-center"
                      maxLength={1}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sound Effects</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Music</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ghost Piece</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
    <>
      <HelpSidebar 
        isOpen={showHelp} 
        onClose={toggleHelp} 
        controls={controls}
      />
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
          <div className="text-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameMenu;
