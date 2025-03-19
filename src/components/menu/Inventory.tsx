import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Filter, Search, Plus, Minus, XCircle } from 'lucide-react';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem } from './types';
import { Button } from "@/components/ui/button";
import { calculatePassiveIncome, calculateBaseCoinsPerSecond } from '@/utils/GameMechanics';
import { motion, AnimatePresence } from 'framer-motion';

const rarityColors = {
  common: 'bg-slate-700 border-slate-500',
  uncommon: 'bg-green-700/40 border-green-500',
  rare: 'bg-blue-700/40 border-blue-500',
  epic: 'bg-purple-700/40 border-purple-500',
  legendary: 'bg-yellow-700/40 border-yellow-500',
};

const FlashAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <motion.div
    className="fixed inset-0 bg-white/70 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 0.5 }}
    onAnimationComplete={onComplete}
  />
);

const TapAnimation: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <motion.div
    className="absolute text-yellow-400 font-bold"
    style={{ left: x, top: y }}
    initial={{ opacity: 1, y: 0 }}
    animate={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    exit={{ opacity: 0 }}
  >
    +Tap
  </motion.div>
);

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
  
  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, maxQuantity));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));
  
  const formatEffect = () => {
    if (!item.effect) return 'No effect';
    const { type, value, duration } = item.effect;
    switch (type) {
      case 'coinMultiplier':
        return `All coin earnings x${value} for ${duration! / 60} minutes`;
      case 'timeWarp':
        return `Gain ${duration! / 60} minutes of passive income instantly`;
      case 'autoTap':
        return `Auto-tap ${value} times/sec for ${duration! / 60} minutes`;
      case 'tapMultiplier':
        return `Tap power x${value} for ${duration} taps`;
      case 'costReduction':
        return `Upgrade costs ${(1 - value) * 100}% cheaper for ${duration! / 60} minutes`;
      case 'essenceMultiplier':
        return `Essence reward +${(value - 1) * 100}% this prestige`;
      case 'baseTapBoost':
        return `Base tap power +${value} permanently`;
      case 'basePassiveBoost':
        return `Base passive income +${value} permanently`;
      case 'noAds':
      case 'unlockAutoBuy':
      case 'inventoryCapacity':
        return item.description;
      default:
        return 'Unknown effect';
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
          <p className="text-sm text-green-400 font-medium text-center mb-4">{formatEffect()}</p>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-8 w-8 p-0 flex items-center justify-center bg-indigo-600/20 border-indigo-500 text-white hover:bg-indigo-700/30"
          >
            <Minus size={16} />
          </Button>
          <div className="text-white text-lg font-medium w-10 text-center">{quantity}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
            className="h-8 w-8 p-0 flex items-center justify-center bg-indigo-600/20 border-indigo-500 text-white hover:bg-indigo-700/30"
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
          className="w-full bg-slate-700/80 text-slate-200 hover:bg-slate-600"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

const BoostNotification: React.FC<{ boost: { id: string; remainingTime?: number; activatedAt?: number }; onDismiss: (id: string) => void }> = ({ boost, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(boost.remainingTime || 0);

  useEffect(() => {
    if (!boost.remainingTime) return;
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const elapsed = now - (boost.activatedAt || 0);
      const remaining = boost.remainingTime! - elapsed;
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

  const boostInfo = {
    'boost-double-coins': 'Coin income x2',
    'boost-time-warp': '+120 min passive income (Instant)',
    'boost-auto-tap': 'Auto-tap 5x/sec',
    'boost-tap-boost': 'Tap income x5',
    'boost-cheap-upgrades': 'Upgrades -10%',
    'boost-essence-boost': 'Essence reward +25%',
    'boost-perma-tap': 'Tap power +1 (Permanent)',
    'boost-perma-passive': 'Passive income +1 (Permanent)',
  };

  return (
    <div className="bg-slate-800 border border-indigo-500/30 rounded-lg p-3 mb-2 flex items-center justify-between w-64">
      <div>
        <p className="text-white font-medium">{boostInfo[boost.id]}</p>
        {boost.remainingTime && <p className="text-sm text-slate-300">{formatTime(timeLeft)}</p>}
      </div>
      <button onClick={() => onDismiss(boost.id)} className="text-slate-400 hover:text-white">
        <XCircle size={20} />
      </button>
    </div>
  );
};

const Inventory: React.FC = () => {
  const { state, dispatch, useItem } = useGame();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [virtualInventory, setVirtualInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; remainingTime?: number; activatedAt?: number }[]>([]);
  const [flash, setFlash] = useState(false);
  const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);
  const clickZoneRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resourceItems: InventoryItem[] = [
      { ...INVENTORY_ITEMS.COINS, quantity: Math.floor(state.coins) },
      { ...INVENTORY_ITEMS.GEMS, quantity: state.gems },
      { ...INVENTORY_ITEMS.ESSENCE, quantity: state.essence },
      { ...INVENTORY_ITEMS.SKILL_POINTS, quantity: state.skillPoints },
    ];
    setVirtualInventory([...resourceItems, ...state.inventory]);
  }, [state.coins, state.gems, state.essence, state.skillPoints, state.inventory]);

  useEffect(() => {
    if (state.boosts["boost-auto-tap"]?.active) {
      const interval = setInterval(() => {
        if (clickZoneRef.current) {
          const rect = clickZoneRef.current.getBoundingClientRect();
          const x = rect.left + Math.random() * rect.width;
          const y = rect.top + Math.random() * rect.height;
          const id = Date.now();
          setTaps(prev => [...prev, { id, x, y }]);
          setTimeout(() => setTaps(prev => prev.filter(t => t.id !== id)), 500);
        }
      }, 200); // 5 taps per second = 200ms interval
      return () => clearInterval(interval);
    }
  }, [state.boosts["boost-auto-tap"]?.active]);

  const handleUseItem = (item: InventoryItem) => {
    if (item.usable) setSelectedItem(item);
  };

  const handleUseConfirm = (item: InventoryItem, quantity: number) => {
    if (!item.usable) return;

    if (item.id === 'boost-time-warp') {
      const passiveIncome = calculatePassiveIncome(state) * calculateBaseCoinsPerSecond(state) / state.coinsPerSecond;
      const reward = passiveIncome * INVENTORY_ITEMS.TIME_WARP.effect!.value * quantity;
      dispatch({ type: 'ADD_COINS', amount: reward });
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }

    useItem(item.id, quantity);
    const boost = state.boosts[item.id];
    if (boost && (boost.remainingTime || boost.active)) {
      setNotifications(prev => [
        ...prev.filter(n => n.id !== item.id),
        { id: item.id, remainingTime: boost.remainingTime, activatedAt: boost.activatedAt }
      ]);
    }
    setSelectedItem(null);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
        <div ref={clickZoneRef} className="relative">
          {flash && <FlashAnimation onComplete={() => setFlash(false)} />}
          <AnimatePresence>
            {taps.map(tap => (
              <TapAnimation key={tap.id} x={tap.x} y={tap.y} />
            ))}
          </AnimatePresence>
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
        </div>
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
