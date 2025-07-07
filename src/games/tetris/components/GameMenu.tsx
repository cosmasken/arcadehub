import React, { useState, useCallback } from 'react';
import { useGame } from '../context';
import { Award, Settings, ShoppingCart, X, Play, Pause, RotateCcw, Home } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getMenuType, getScoreDisplay, getControlInstructions } from '../utils/gameStateUtils';
import Achievements from './Achievements';
import Shop from './Shop';

// Define tab types with string literal union for better type safety
type TabType = 'main' | 'achievements' | 'upgrades' | 'settings';

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
      'flex items-center px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm',
      active
        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
    )}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

// Enhanced GameMenu with better state management
const GameMenu: React.FC<GameMenuProps> = ({
  onStart,
  onResume,
  onRestart,
  onQuit,
  onSave,
}) => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('main');
  
  // Use utility functions for cleaner logic
  const menuType = getMenuType(state);
  const scoreDisplay = getScoreDisplay(state);
  const controlInstructions = getControlInstructions(state.settings.controls);

  const getTitle = () => {
    switch (menuType) {
      case 'start': return 'TETRIS';
      case 'pause': return 'PAUSED';
      case 'gameOver': return 'GAME OVER';
      default: return 'TETRIS';
    }
  };

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const getMainActionButton = () => {
    const buttonClass = "w-full py-3 px-6 rounded-lg text-base font-bold transition-all transform hover:scale-105 mb-3 flex items-center justify-center gap-2";
    
    switch (menuType) {
      case 'start':
        return (
          <button
            onClick={onStart}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white`}
          >
            <Play className="w-5 h-5" />
            START GAME
          </button>
        );
      
      case 'pause':
        return (
          <button
            onClick={onResume}
            className={`${buttonClass} bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white`}
          >
            <Play className="w-5 h-5" />
            RESUME
          </button>
        );
      
      case 'gameOver':
        return (
          <button
            onClick={onRestart}
            className={`${buttonClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white`}
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>
        );
      
      default:
        return null;
    }
  };

  const getSecondaryButtons = () => {
    const buttonClass = "w-full py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2";
    
    if (menuType === 'start') {
      return (
        <div className="space-y-2">
          <button
            onClick={onQuit}
            className={`${buttonClass} bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white`}
          >
            <Home className="w-4 h-4" />
            BACK TO MENU
          </button>
        </div>
      );
    }
    
    if (menuType === 'pause' || menuType === 'gameOver') {
      return (
        <div className="space-y-2">
          <button
            onClick={() => {
              setActiveTab('main');
              onRestart();
            }}
            className={`${buttonClass} bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white`}
          >
            <RotateCcw className="w-4 h-4" />
            NEW GAME
          </button>
          
          {onSave && (
            <button
              onClick={onSave}
              className={`${buttonClass} bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white`}
            >
              💾 SAVE GAME
            </button>
          )}
          
          <button
            onClick={onQuit}
            className={`${buttonClass} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white`}
          >
            <Home className="w-4 h-4" />
            EXIT TO MENU
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Settings tab content component
  const SettingsTabContent: React.FC = () => {
    const controls = state.settings.controls || {};
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Move Left', key: controls.moveLeft || '←' },
            { label: 'Move Right', key: controls.moveRight || '→' },
            { label: 'Rotate', key: controls.rotate || '↑' },
            { label: 'Soft Drop', key: controls.softDrop || '↓' },
            { label: 'Hard Drop', key: controls.hardDrop || 'Space' },
            { label: 'Hold Piece', key: controls.hold || 'C' },
            { label: 'Pause', key: controls.pause || 'P' }
          ].map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-gray-400 text-xs">{item.label}</p>
              <kbd className="block px-2 py-1 bg-gray-800 rounded text-gray-300 text-center text-xs font-mono">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-bold text-white mt-6 mb-4">Display Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Show Ghost Piece</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${
              state.settings.ghostPiece ? 'bg-cyan-500' : 'bg-gray-700'
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                state.settings.ghostPiece ? 'left-5' : 'left-1'
              }`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Sound Effects</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${
              state.settings.soundEnabled ? 'bg-cyan-500' : 'bg-gray-700'
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                state.settings.soundEnabled ? 'left-5' : 'left-1'
              }`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Music</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${
              state.settings.musicEnabled ? 'bg-cyan-500' : 'bg-gray-700'
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                state.settings.musicEnabled ? 'left-5' : 'left-1'
              }`}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <h4 className="text-sm font-medium text-cyan-400 mb-2">Quick Tips</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• {controlInstructions.objective}</div>
            <div>• {controlInstructions.strategy}</div>
            <div>• Hold pieces for better positioning</div>
            <div>• Use hard drop for quick placement</div>
          </div>
        </div>
      </div>
    );
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
            {/* Title */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-2">
                {getTitle()}
              </h2>

              {/* Score Display */}
              {(menuType === 'pause' || menuType === 'gameOver') && (
                <div className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-2xl text-cyan-400 font-bold mb-1">
                    {scoreDisplay.current.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Current Score</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-purple-400 font-bold">{scoreDisplay.level}</div>
                      <div className="text-xs text-gray-400">Level</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">{scoreDisplay.lines}</div>
                      <div className="text-xs text-gray-400">Lines</div>
                    </div>
                  </div>
                  
                  {scoreDisplay.showHighScore && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className={`text-lg font-bold ${scoreDisplay.isNewHighScore ? 'text-yellow-300 animate-pulse' : 'text-yellow-400'}`}>
                        {scoreDisplay.high.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {scoreDisplay.isNewHighScore ? '🎉 New High Score!' : 'High Score'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Game Instructions for Start Menu */}
            {menuType === 'start' && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-2">
                    🎯 <strong>Objective:</strong> {controlInstructions.objective}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🎮 {controlInstructions.movement}</div>
                    <div>🔄 {controlInstructions.rotation}</div>
                    <div>⬇️ {controlInstructions.dropping}</div>
                    <div>📦 {controlInstructions.hold}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {getMainActionButton()}
              {getSecondaryButtons()}
            </div>

            {/* Quick Access Tabs */}
            {menuType === 'start' && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onClick={() => handleTabChange('achievements')}
                  className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200"
                >
                  <Award className="w-5 h-5 text-yellow-400 mb-1" />
                  <span className="text-xs text-gray-300">Achievements</span>
                </button>
                <button
                  onClick={() => handleTabChange('upgrades')}
                  className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5 text-purple-400 mb-1" />
                  <span className="text-xs text-gray-300">Shop</span>
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
                >
                  <Settings className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-xs text-gray-300">Settings</span>
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
      <div className="bg-gray-900/95 p-6 rounded-xl border border-cyan-400/20 shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 hover:shadow-cyan-500/20">
        {/* Tab Navigation */}
        {activeTab !== 'main' && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === 'achievements'}
                onClick={() => handleTabChange('achievements')}
                icon={<Award className="w-4 h-4" />}
                label="Achievements"
              />
              <TabButton
                active={activeTab === 'upgrades'}
                onClick={() => handleTabChange('upgrades')}
                icon={<ShoppingCart className="w-4 h-4" />}
                label="Shop"
              />
              <TabButton
                active={activeTab === 'settings'}
                onClick={() => handleTabChange('settings')}
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
              />
            </div>
            <button
              onClick={() => handleTabChange('main')}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
