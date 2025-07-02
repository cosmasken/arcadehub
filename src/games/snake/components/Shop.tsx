import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { SHOP_ITEMS } from '../constants';

interface ShopProps {
  shopOpen: boolean;
  setShopOpen: () => void;
  onOpen: () => void;
  onClose: () => void;
  onBuy?: () => void;
}

const Shop: React.FC<ShopProps> = ({ shopOpen, setShopOpen, onOpen, onClose, onBuy }) => {
  const { state, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<'skins' | 'powerups'>('skins');

  const ownedItems = state.inventory;

  const filteredItems = SHOP_ITEMS.filter(item =>
    activeTab === 'skins' ? item.type === 'skin' : item.type === 'powerup'
  );

  return (
    <div className="bg-gray-900/95 rounded-lg p-6 shadow-2xl border border-cyan-400/30 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">🛒 SHOP</h2>
        <button
          className="text-gray-400 hover:text-gray-200 text-3xl font-bold transition-colors duration-200"
          onClick={() => { setShopOpen(); onClose(); }}
          aria-label="Close Shop"
        >
          ×
        </button>
      </div>

      <div className="flex mb-6 border-b border-gray-600">
        <button
          className={`px-6 py-3 font-medium transition-all duration-200 ${activeTab === 'skins'
            ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => setActiveTab('skins')}
        >
          🎨 Skins
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all duration-200 ${activeTab === 'powerups'
            ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => setActiveTab('powerups')}
        >
          ⚡ Power-ups
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/50 hover:border-cyan-400/30"
              >
                <div className="flex items-center">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-12 h-12 object-contain mr-4 rounded-lg bg-gray-700/50 p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-100 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-4 text-lg">{item.price} 🪙</span>
                  <button
                    onClick={() => {
                      buyItem(item.id);
                      if (onBuy) onBuy();
                    }}
                    disabled={state.coins < item.price || Boolean(ownedItems[item.id])}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 ${ownedItems[item.id]
                      ? 'bg-green-500/20 text-green-400 border border-green-400/50 cursor-default'
                      : state.coins >= item.price
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {ownedItems[item.id] ? '✓ OWNED' : 'BUY'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📦</div>
              <p>No items available in this category</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-600 flex justify-between items-center bg-gray-800/30 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <span className="text-gray-300 font-medium">Your Balance:</span>
        <div className="flex items-center bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/30">
          <span className="font-bold text-xl mr-2 text-yellow-400">{state.coins}</span>
          <span className="text-yellow-400 text-xl">🪙</span>
        </div>
      </div>
    </div>
  );
};

export default Shop;
