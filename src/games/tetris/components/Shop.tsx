import React, { useState } from 'react';
import { useGame } from '../context';
import { SHOP_ITEMS } from '../constants';

const Shop: React.FC = () => {
  const { state, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<'upgrade' | 'theme'>('upgrade');
  
  const availableItems = SHOP_ITEMS.filter(item => 
    item.type === activeTab && 
    (item.maxLevel === undefined || (state.stats.inventory[item.id] || 0) < item.maxLevel)
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Shop</h3>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('upgrade')}
          className={`px-3 py-1 rounded ${activeTab === 'upgrade' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Upgrades
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-3 py-1 rounded ${activeTab === 'theme' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Themes
        </button>
      </div>
      <div className="space-y-2">
        {availableItems.map((item) => (
          <div key={item.id} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-sm text-gray-300">{item.description}</p>
                {item.maxLevel && (
                  <p className="text-xs text-gray-400">
                    Level: {(state.stats.inventory[item.id] || 0)}/{item.maxLevel}
                  </p>
                )}
              </div>
              <button
                onClick={() => buyItem(item.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                disabled={state.stats.coins < item.price}
              >
                {item.price} Coins
              </button>
            </div>
          </div>
        ))}
        {availableItems.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No more items available in this category
          </p>
        )}
      </div>
    </div>
  );
};

export default Shop;
