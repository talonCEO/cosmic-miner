import React, { useState } from 'react';
import { Sparkles, Gem, X } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import GemPackage from './GemPackage';
import BoostItem from './BoostItem';
import { gemPackages } from './types/premiumStore';
import { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { INVENTORY_ITEMS, InventoryItem } from '@/components/menu/types';

// Placeholder image function
const getPlaceholderImage = (itemName: string): string => {
  return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';
};

interface PremiumStoreProps {
  onBuyGemPackage: (packageId: string, amount: number) => void;
}

// Define a specific type for boost items in the store
interface StoreBoostItem extends InventoryItem {
  cost: number; // Required for boosts
  maxPurchases: number; // Required for boosts
  purchasable: boolean;
  purchased: number;
}

const PremiumStore: React.FC<PremiumStoreProps> = ({ onBuyGemPackage }) => {
  const { state, addGems, addItem } = useGame();
  const [unlockAnimation, setUnlockAnimation] = useState<{
    show: boolean;
    item: InventoryItem | null;
    isGemPackage?: boolean;
    gemAmount?: number;
    image?: string;
  }>({
    show: false,
    item: null,
  });

  const boostItems = useMemo(() => {
    return Object.values(INVENTORY_ITEMS)
      .filter((item): item is InventoryItem & { cost: number; maxPurchases: number } => 
        item.type === 'boost' && item.usable && 'cost' in item && 'maxPurchases' in item
      )
      .map(item => ({
        ...item,
        purchased: state.boosts[item.id]?.purchased || 0,
        maxPurchases: item.maxPurchases,
        purchasable: state.gems >= item.cost && (state.boosts[item.id]?.purchased || 0) < item.maxPurchases,
        quantity: 1,
      } as StoreBoostItem));
  }, [state.boosts, state.gems]);

  const showUnlockAnimation = (item: InventoryItem) => {
    setUnlockAnimation({ show: true, item, isGemPackage: false });
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const showGemUnlockAnimation = (amount: number, image: string) => {
    setUnlockAnimation({ show: true, item: null, isGemPackage: true, gemAmount: amount, image });
    addGems(amount);
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const hideUnlockAnimation = () => {
    setUnlockAnimation({ show: false, item: null });
  };

  const sortedBoostItems = useMemo(() => {
    const priorityOrder = ['boost-no-ads', 'boost-auto-buy', 'boost-inventory-expansion'];
    return [...boostItems].sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.id);
      const bPriority = priorityOrder.indexOf(b.id);
      const aMaxed = a.purchased >= a.maxPurchases;
      const bMaxed = b.purchased >= b.maxPurchases;

      if (aMaxed === bMaxed) {
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return a.cost - b.cost;
      }
      return aMaxed ? 1 : -1;
    });
  }, [boostItems]);

  const onBuyBoostItem = (itemId: string) => {
    const item = sortedBoostItems.find(i => i.id === itemId);
    if (!item || state.gems < item.cost || item.purchased >= item.maxPurchases) return;

    addGems(-item.cost);
    const inventoryItem: InventoryItem = { ...item, quantity: 1 };
    addItem(inventoryItem);
    showUnlockAnimation(inventoryItem);
  };

  // Rest of the component remains unchanged
  return (
    // ... (JSX unchanged)
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20 relative">
        <DialogTitle className="text-xl">Premium Store</DialogTitle>
      </DialogHeader>
      <AnimatePresence>
        {/* ... (unlock animation JSX unchanged) */}
      </AnimatePresence>
      <ScrollArea className="h-[60vh]">
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">Gem Packages</h3>
              <div className="flex items-center">
                <Gem className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="text-yellow-400 font-bold">{state.gems}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {gemPackages.map(pack => (
                <GemPackage 
                  key={pack.id} 
                  pack={pack} 
                  onPurchase={() => {
                    onBuyGemPackage(pack.id, pack.amount);
                    showGemUnlockAnimation(pack.amount, pack.image);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">Boost Items</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sortedBoostItems.map(item => (
                <BoostItem 
                  key={item.id} 
                  item={item}
                  onPurchase={onBuyBoostItem}
                  showUnlockAnimation={showUnlockAnimation}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default PremiumStore;
