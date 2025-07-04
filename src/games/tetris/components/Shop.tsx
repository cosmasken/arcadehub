import React, { useState } from 'react';
import { useGame } from '../context';
import { SHOP_ITEMS } from '../constants';
import { cn } from '../../../lib/utils';
import MintingModal from '../../../components/MintingModal';

type TabType = 'all' | 'upgrades' | 'themes';

const Shop: React.FC = () => {
  const { state, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [mintingItem, setMintingItem] = useState(null);
  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);

  const filteredItems = SHOP_ITEMS.filter(item => {
    if (activeTab === 'upgrades') return item.type === 'upgrade';
    if (activeTab === 'themes') return item.type === 'theme';
    return true;
  });

  const handleMint = (item) => {
    setMintingItem(item);
    setIsMintingModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200 font-medium',
            activeTab === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          )}
        >
          All Items
        </button>
        <button
          onClick={() => setActiveTab('upgrades')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200 font-medium',
            activeTab === 'upgrades'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          )}
        >
          Upgrades
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-200 font-medium',
            activeTab === 'themes'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          )}
        >
          Themes
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isOwned = state.stats.inventory[item.id];
            const canAfford = state.stats.coins >= item.price;
            const level = state.stats.inventory[item.id] || 0;
            const maxLevel = item.maxLevel || 1;
            const isMaxLevel = level >= maxLevel;

            return (
              <div
                key={item.id}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200',
                  isOwned
                    ? 'bg-green-900/20 border-green-500/30'
                    : canAfford
                      ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                      : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-2xl mr-3">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-200">
                        {item.name}
                        {maxLevel > 1 && (
                          <span className="ml-2 text-sm text-gray-400">
                            Level {level}/{maxLevel}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div>
                    {isMaxLevel ? (
                      <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg font-bold">
                        MAXED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMint(item)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-bold transition-all duration-200',
                          'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90'
                        )}
                      >
                        MINT & UNLOCK
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No items found in this category
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Balance:</span>
          <div className="flex items-center bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/30">
            <span className="font-bold text-xl mr-2 text-yellow-400">{state.stats.coins}</span>
            <span className="text-yellow-400 text-xl">🪙</span>
          </div>
        </div>
      </div>
    </div>
      {mintingItem && (
        <MintingModal
          isOpen={isMintingModalOpen}
          onClose={() => { setIsMintingModalOpen(false); setMintingItem(null); }}
          achievement={mintingItem}
          setIsLoadingModalOpen={() => {}}
          onMintSuccess={() => {
            buyItem(mintingItem.id);
            setIsMintingModalOpen(false);
            setMintingItem(null);
          }}
        />
      )}
    </>
  );
};

export default Shop;
