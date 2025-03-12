
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Filter, Search } from 'lucide-react';
import { InventoryItem } from './types';

const rarityColors = {
  common: 'bg-slate-700 border-slate-500',
  uncommon: 'bg-green-700/40 border-green-500',
  rare: 'bg-blue-700/40 border-blue-500',
  epic: 'bg-purple-700/40 border-purple-500',
  legendary: 'bg-yellow-700/40 border-yellow-500',
};

const ItemCard: React.FC<{ item: InventoryItem; onUse: (item: InventoryItem) => void }> = ({ item, onUse }) => {
  return (
    <div className={`relative rounded-lg p-3 ${rarityColors[item.rarity]} border transition-all hover:scale-[1.02] cursor-pointer`}>
      <div className="flex flex-col items-center">
        <div className="text-center mb-1 font-medium text-sm">{item.name}</div>
        <div className="w-10 h-10 flex items-center justify-center mb-1 text-lg">
          {item.icon}
        </div>
        {item.quantity > 1 && (
          <div className="absolute top-1 right-1 bg-slate-800/80 text-white text-xs px-1 rounded-full">
            x{item.quantity}
          </div>
        )}
        {item.usable && (
          <button
            onClick={() => onUse(item)}
            className="mt-1 w-full text-xs bg-indigo-600/80 py-1 px-2 rounded-md hover:bg-indigo-700"
          >
            Use
          </button>
        )}
      </div>
    </div>
  );
};

const Inventory: React.FC = () => {
  const { state, dispatch, useItem } = useGame();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const handleUseItem = (item: InventoryItem) => {
    if (item.usable) {
      useItem(item.id);
    }
  };
  
  // Filter and search logic
  const filteredItems = state.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesFilter;
  });
  
  const inventoryCapacity = state.inventoryCapacity || 100;
  const inventoryUsed = state.inventory.reduce((total, item) => total + (item.stackable ? 1 : item.quantity), 0);
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
          <Package size={20} />
          <span>Inventory</span>
        </DialogTitle>
        <div className="text-center text-slate-300 text-sm">
          Space used: {inventoryUsed}/{inventoryCapacity}
        </div>
      </DialogHeader>
      
      <div className="p-4 border-b border-indigo-500/20">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full bg-slate-800/50 border border-slate-700 text-white py-2 pl-8 pr-3 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-slate-800/50 border border-slate-700 text-white py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="boost">Boosts</option>
              <option value="reward">Rewards</option>
              <option value="gift">Gifts</option>
              <option value="consumable">Consumables</option>
            </select>
            <Filter className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[50vh] p-4">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} onUse={handleUseItem} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Package size={40} className="mb-2 opacity-50" />
            <p className="text-center">
              {searchTerm || filterType !== 'all' 
                ? "No matching items found" 
                : "Your inventory is empty"}
            </p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Inventory;
