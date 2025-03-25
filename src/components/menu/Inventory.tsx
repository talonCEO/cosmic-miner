import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Filter, Search, Plus, Minus, XCircle } from 'lucide-react';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem, BoostEffect } from './types';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { formatNumber } from '@/utils/gameLogic';

const rarityColors = {
  common: 'bg-slate-700 border-slate-500',
  uncommon: 'bg-green-700/40 border-green-500',
  rare: 'bg-blue-700/40 border-blue-500',
  epic: 'bg-purple-700/40 border-purple-500',
  legendary: 'bg-yellow-700/40 border-yellow-500',
};

const ItemSlot: React.FC<{ 
  item?: InventoryItem; 
  onItemClick: (item: InventoryItem) => void;
  isEmpty?: boolean;
}> = ({ item, onItemClick, isEmpty = false }) => {
  if (isEmpty || !item) {
    return (
      <div className="w-full h-full aspect-square rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
        <div className="text-slate-600/50 opacity-30">
          <Package size={24} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-full aspect-square rounded-lg ${rarityColors[item.rarity]} border p-2 flex flex-col items-center justify-center ${item.usable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => item.usable && onItemClick(item)}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="absolute top-1 left-1 right-1 text-center overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-slate-200">
          {item.name}
        </div>
        
        <div className="flex-1 flex items-center justify-center my-4">
          <div className="text-3xl">{item.icon}</div>
        </div>
        
        {item.quantity > 1 && (
          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center justify-center min-w-[24px]">
            {item.quantity}
          </div>
        )}
      </div>
    </div>
  );
};

const UseItemPopover: React.FC<{ 
  item: InventoryItem; 
  onUse: (item: InventoryItem, quantity: number) => void;
  onClose: () => void;
}> = ({ item, onUse, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = item.quantity;
  
  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-4 w-72 max-w-[90vw]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="text-4xl mb-3">{item.icon}</div>
          <p className="text-sm text-slate-300 text-center mb-3">{item.description}</p>
          <p className="text-sm text-green-400 font-medium text-center mb-4">
            {item.effect ? `${item.effect.type}: +${item.effect.value}${item.effect.duration ? ` (${Math.floor(item.effect.duration / 60)} minutes)` : ''}` : 'No effect'}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <Minus size={16} />
          </Button>
          <div className="text-white text-lg font-medium w-10 text-center">{quantity}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <Button 
          onClick={() => onUse(item, quantity)}
          className="w-full mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          Use
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

const BoostNotification: React.FC<{ boost: BoostEffect; onDismiss: (id: string) => void }> = ({ boost, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(boost.remainingTime || 0);

  useEffect(() => {
    if (!boost.duration) return;
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const remaining = boost.duration! - (now - (boost.activatedAt || 0));
      setTimeLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) onDismiss(boost.id);
    }, 1000);
    return () => clearInterval(interval);
  }, [boost, onDismiss]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const boostInfo: Record<string, string> = {
    'boost-double-coins': 'Coin income x2',
    'boost-time-warp': '+120 min passive income',
    'boost-auto-tap': 'Auto-tap 5x/sec',
    'boost-tap-boost': 'Tap income x3',
    'boost-essence-boost': 'Essence reward +25%',
    'boost-perma-tap': 'Tap power +1 (Permanent)',
    'boost-perma-passive': 'Passive income +1 (Permanent)',
  };

  return (
    <div className="bg-slate-800 border border-indigo-500/30 rounded-lg p-3 mb-2 flex items-center justify-between w-64">
      <div>
        <p className="text-white font-medium">{boostInfo[boost.id] || boost.name}</p>
        {boost.duration && <p className="text-sm text-slate-300">{formatTime(timeLeft)}</p>}
      </div>
      <button onClick={() => onDismiss(boost.id)} className="text-slate-400 hover:text-white">
        <XCircle size={20} />
      </button>
    </div>
  );
};

const Inventory: React.FC = () => {
  const { state, useItem, addItem } = useGame();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [virtualInventory, setVirtualInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<BoostEffect[]>([]);
  
useEffect(() => {
  const resourceItems: InventoryItem[] = [
    { ...INVENTORY_ITEMS.COINS, quantity: Math.floor(state.coins), name: `${formatNumber(Math.floor(state.coins))} Coins` },
    { ...INVENTORY_ITEMS.GEMS, quantity: state.gems, name: `${formatNumber(state.gems)} Gems` },
    { ...INVENTORY_ITEMS.ESSENCE, quantity: state.essence, name: `${formatNumber(state.essence)} Essence` },
    { ...INVENTORY_ITEMS.SKILL_POINTS, quantity: state.skillPoints, name: `${formatNumber(state.skillPoints)} Skill Points` },
  ];
  setVirtualInventory([...resourceItems, ...state.inventory]);
}, [state.coins, state.gems, state.essence, state.skillPoints, state.inventory]);
  
  const handleUseItem = (item: InventoryItem) => {
    if (item.usable) {
      setSelectedItem(item);
    }
  };
  
  const handleUseConfirm = (item: InventoryItem, quantity: number) => {
    if (item.usable) {
      const trackedBoostIds = [
        'boost-double-coins', 'boost-time-warp', 'boost-auto-tap',
        'boost-tap-boost', 'boost-cheap-upgrades', 'boost-essence-boost',
        'boost-perma-tap', 'boost-perma-passive'
      ];
      
      useItem(item.id, quantity);
      
      toast({
        title: `${item.name} Used`,
        description: `${quantity > 1 ? `${quantity}x ` : ''}${item.description}`,
        duration: 3000,
      });
      
      if (trackedBoostIds.includes(item.id)) {
        setTimeout(() => {
          const newBoost = state.activeBoosts.find(boost => boost.id === item.id);
          if (newBoost && !notifications.some(n => n.id === newBoost.id)) {
            setNotifications([...notifications, newBoost]);
          }
        }, 100);
      }
      
      setSelectedItem(null);
    }
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const filteredItems = virtualInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });
  
  const inventoryCapacity = state.inventoryCapacity || 25;
  const inventoryUsed = state.inventory.reduce((total, item) => total + (item.stackable ? 1 : item.quantity), 0);
  
  const renderInventoryGrid = () => {
    const slots = [];
    const baseSlots = 25;
    const expansionsPurchased = state.boosts['boost-inventory-expansion']?.purchased || 0;
    const totalSlots = baseSlots + expansionsPurchased * 5;
    
    for (let i = 0; i < totalSlots; i++) {
      if (i < filteredItems.length) {
        slots.push(
          <div key={i} className="aspect-square">
            <ItemSlot item={filteredItems[i]} onItemClick={handleUseItem} />
          </div>
        );
      } else {
        slots.push(
          <div key={i} className="aspect-square">
            <ItemSlot isEmpty={true} onItemClick={() => {}} />
          </div>
        );
      }
    }
    return <div className="grid grid-cols-5 gap-3">{slots}</div>;
  };
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
          <Package size={20} />
          <span>Inventory</span>
        </DialogTitle>
        <div className="text-center text-slate-300 text-sm">
          Space used: {state.inventory.reduce((total, item) => total + (item.stackable ? 1 : item.quantity), 0)}/{state.inventoryCapacity}
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
              className="appearance-none bg-slate-800/50 border border BASICSslate-700 text-white py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="resource">Resources</option>
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
          renderInventoryGrid()
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Package size={40} className="mb-2 opacity-50" />
            <p className="text-center">
              {searchTerm || filterType !== 'all' ? "No matching items found" : "Your inventory is empty"}
            </p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
      
      {selectedItem && (
        <UseItemPopover 
          item={selectedItem} 
          onUse={handleUseConfirm}
          onClose={() => setSelectedItem(null)}
        />
      )}
      
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
        {notifications.map(boost => (
          <BoostNotification key={boost.id + (boost.activatedAt || 0)} boost={boost} onDismiss={dismissNotification} />
        ))}
      </div>
    </>
  );
};

export default Inventory;

