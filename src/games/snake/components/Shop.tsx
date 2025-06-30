import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { SHOP_ITEMS } from '../constants';

const Shop: React.FC = () => {
  const { state, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<'skins' | 'powerups'>('skins');
  
  const ownedItems = state.inventory;
  
  const filteredItems = SHOP_ITEMS.filter(item => 
    activeTab === 'skins' ? item.type === 'skin' : item.type === 'powerup'
  );
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Shop</h2>
      
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'skins' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('skins')}
        >
          Skins
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'powerups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('powerups')}
        >
          Power-ups
        </button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <img 
                  src={item.icon} 
                  alt={item.name} 
                  className="w-10 h-10 object-contain mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40';
                  }}
                />
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-600 font-medium mr-2">{item.price} 🪙</span>
                <button
                  onClick={() => buyItem(item.id)}
                  disabled={state.coins < item.price}
                  className={`px-3 py-1 rounded text-sm font-medium ${state.coins >= item.price 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {ownedItems[item.id] ? 'Owned' : 'Buy'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No items available in this category
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t flex justify-between items-center">
        <span className="text-gray-600">Your coins:</span>
        <div className="flex items-center">
          <span className="font-semibold mr-1">{state.coins}</span>
          <span className="text-yellow-500">🪙</span>
        </div>
      </div>
    </div>
  );
};

export default Shop;
