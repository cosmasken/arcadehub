import React, { useState, useCallback } from 'react';
import { useGame } from '../context';
import { Award, Settings, ShoppingCart, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Achievements from './Achievements';
import Shop from './Shop';

// Settings tab content component
const SettingsTabContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Controls</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Move Left</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">←</kbd>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Move Right</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">→</kbd>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Rotate</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">↑</kbd>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Soft Drop</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">↓</kbd>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Hard Drop</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Space</kbd>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Hold Piece</p>
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">C</kbd>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mt-6 mb-4">Display Options</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Show Ghost Piece</span>
          <div className="w-10 h-6 bg-gray-700 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-cyan-500 rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Sound Effects</span>
          <div className="w-10 h-6 bg-gray-700 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-cyan-500 rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Music</span>
          <div className="w-10 h-6 bg-gray-700 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-cyan-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define tab types with string literal union for better type safety
type TabType = 'main' | 'achievements' | 'upgrades' | 'settings';

// Define menu types for better type safety
type MenuType = 'start' | 'pause' | 'gameOver';

interface GameMenuProps {
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onSave?: () => void;
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
      'flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium',
      active
        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
    )}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

// GameMenu is now fully context-driven: menu type, score, highScore, and level are sourced from useGame() only.
const GameMenu: React.FC<Omit<GameMenuProps, 'type' | 'score' | 'highScore' | 'level'>> = ({
  onStart,
  onResume,
  onRestart,
  onQuit,
  onSave,
}) => {
  const { state } = useGame();
  const type = state.gameOver ? 'gameOver' : (state.isPaused ? 'pause' : 'start');
  const score = state.stats?.score ?? 0;
  const highScore = state.stats?.highScore ?? 0;
  const level = state.stats?.level ?? 1;
  const [activeTab, setActiveTab] = useState<TabType>('main');

  const title = type === 'start' ? 'TETRIS' :
    type === 'pause' ? 'PAUSED' : 'GAME OVER';

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const getActionButton = () => {
    if (type === 'start') {
      return (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Start Game
        </button>
      );
    } else if (type === 'pause') {
      return (
        <button
          onClick={onResume}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Continue Playing
        </button>
      );
    } else {
      return (
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3"
        >
          Play Again
        </button>
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'achievements':
        return <Achievements />;
      case 'upgrades':
        return <Shop />;
      case 'settings':
        return <SettingsTabContent />;
      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-2">
                {title}
              </h2>

              {(type === 'pause' || type === 'gameOver') && (
                <div className="mt-4 space-y-2">
                  <p className="text-2xl text-gray-200">
                    Score: <span className="text-cyan-400">{score}</span>
                  </p>
                  {highScore > 0 && (
                    <p className="text-lg text-gray-400">
                      High Score: <span className="text-yellow-400">{highScore}</span>
                    </p>
                  )}
                  <p className="text-gray-400">
                    Level: <span className="text-purple-400">{level}</span>
                  </p>
                </div>
              )}
            </div>

            {type === 'start' && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-300 text-center">
                  Use arrow keys to move and rotate pieces
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Fill complete rows to score points and level up!
                </p>
              </div>
            )}

            <div className="space-y-3">
              {getActionButton()}

              {(type === 'pause' || type === 'gameOver') && onSave && (
                <button
                  onClick={onSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors"
                >
                  Save Game
                </button>
              )}

              {(type === 'pause' || type === 'gameOver') && (
                <button
                  onClick={() => {
                    // Force back to main tab when restarting
                    setActiveTab('main');
                    // Call the onRestart function to completely reset the game state
                    onRestart();
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  New Game
                </button>
              )}

              <button
                onClick={onQuit}
                className="w-full bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white py-2 px-4 rounded-lg text-sm font-medium border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Exit to Menu
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => handleTabChange('achievements')}
                className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200"
              >
                <Award className="w-6 h-6 text-yellow-400 mb-1" />
                <span className="text-xs text-gray-300">Achievements</span>
              </button>
              <button
                onClick={() => handleTabChange('upgrades')}
                className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
              >
                <ShoppingCart className="w-6 h-6 text-purple-400 mb-1" />
                <span className="text-xs text-gray-300">Shop</span>
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
              >
                <Settings className="w-6 h-6 text-blue-400 mb-1" />
                <span className="text-xs text-gray-300">Settings</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
      <div className="bg-gray-900/95 p-8 rounded-xl border border-cyan-400/20 shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-cyan-500/20">
        {activeTab !== 'main' && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === 'achievements'}
                onClick={() => handleTabChange('achievements')}
                icon={<Award className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Achievements"
              />
              <TabButton
                active={activeTab === 'upgrades'}
                onClick={() => handleTabChange('upgrades')}
                icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Shop"
              />
              <TabButton
                active={activeTab === 'settings'}
                onClick={() => handleTabChange('settings')}
                icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Settings"
              />
            </div>
            <button
              onClick={() => handleTabChange('main')}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
