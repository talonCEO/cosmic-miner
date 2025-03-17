
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

const getPlaceholderImage = (itemName: string): string => {
  return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';
};

interface PremiumStoreProps {
  onBuyGemPackage: (packageId: string, amount: number) => void;
}

export interface StoreBoostItem extends InventoryItem {
  cost: number; // Required for all boosts in the store
  maxPurchases: number; // Required, not optional
  purchasable: boolean;
  purchased: number;
}

const PremiumStore: React.FC<PremiumStoreProps> = ({ onBuyGemPackage }) => {
  const { state, addGems, addItem, dispatch } = useGame();
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
      .filter(item => 
        item.type === 'boost' && 'cost' in item && typeof item.cost === 'number'
      )
      .map(item => {
        const purchased = state.boosts[item.id]?.purchased || 0;
        // Safely access maxPurchases with a type guard
        const itemWithCost = item as InventoryItem & { cost: number, maxPurchases?: number };
        const maxPurchases = 
          item.id === 'boost-auto-buy' || item.id === 'boost-no-ads' ? 1 :
          item.id === 'boost-inventory-expansion' ? 5 : 
          itemWithCost.maxPurchases || Infinity;
        
        return {
          ...item,
          cost: itemWithCost.cost, 
          purchased,
          maxPurchases, // Make sure this is not optional
          purchasable: state.gems >= itemWithCost.cost && purchased < maxPurchases,
          quantity: 1,
        } as StoreBoostItem;
      });
  }, [state.boosts, state.gems]);

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

  const showUnlockAnimation = (item: InventoryItem) => {
    setUnlockAnimation({
      show: true,
      item,
      isGemPackage: false,
    });
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const showGemUnlockAnimation = (amount: number, image: string) => {
    setUnlockAnimation({
      show: true,
      item: null,
      isGemPackage: true,
      gemAmount: amount,
      image,
    });
    addGems(amount);
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const hideUnlockAnimation = () => {
    setUnlockAnimation({
      show: false,
      item: null,
    });
  };

  const onBuyBoostItem = (itemId: string) => {
    const item = sortedBoostItems.find(i => i.id === itemId);
    if (!item || state.gems < item.cost || item.purchased >= item.maxPurchases) return;

    addGems(-item.cost);

    // Special handling for auto-buy, no-ads, and inventory-expansion
    switch (item.id) {
      case 'boost-auto-buy':
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id }); // Only updates purchased count
        break;
      case 'boost-no-ads':
        dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'hasNoAds', value: true });
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id }); // Updates purchased count
        break;
      case 'boost-inventory-expansion':
        dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'inventoryCapacity', value: state.inventoryCapacity + 5 });
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id }); // Updates purchased count
        break;
      default:
        const inventoryItem: InventoryItem = { ...item, quantity: 1 };
        addItem(inventoryItem);
        showUnlockAnimation(inventoryItem);
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id }); // Updates purchased count for all boosts
    }
  };

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20 relative">
        <DialogTitle className="text-xl">Premium Store</DialogTitle>
      </DialogHeader>
      
      <AnimatePresence>
        {unlockAnimation.show && (
          <motion.div
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center gap-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-amber-400"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{ 
                        x: Math.cos(i * 30 * (Math.PI / 180)) * 100,
                        y: Math.sin(i * 30 * (Math.PI / 180)) * 100,
                        opacity: [0, 1, 0]
                      }}
                      transition={{ duration: 1.5 + (i % 3) * 0.5, repeat: Infinity, repeatType: "loop", ease: "easeOut", delay: i * 0.1 }}
                    />
                  ))}
                </div>
                <motion.div
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg shadow-amber-500/50 z-10 relative"
                  animate={{ boxShadow: ["0 0 20px 0px #f59e0b50", "0 0 40px 10px #f59e0b80", "0 0 20px 0px #f59e0b50"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <img 
                    src={unlockAnimation.isGemPackage ? unlockAnimation.image : (unlockAnimation.item ? getPlaceholderImage(unlockAnimation.item.name) : '')}
                    alt={unlockAnimation.isGemPackage ? "Gems" : (unlockAnimation.item?.name || "Item")}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-amber-400 mb-2">
                  {unlockAnimation.isGemPackage ? `${unlockAnimation.gemAmount} Gems` : unlockAnimation.item?.name}
                </h2>
                <p className="text-green-400 font-semibold mb-8">
                  {unlockAnimation.isGemPackage ? "Added to your account" : unlockAnimation.item?.description}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="h-[60vh]">
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">
                Gem Packages
              </h3>
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
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">
                Boost Items
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sortedBoostItems.map(item => (
                <div
                  key={item.id}
                  className={`transition-opacity duration-300 ${
                    item.purchasable ? '' : 'opacity-50 pointer-events-none'
                  }`}
                >
                  <BoostItem 
                    item={item}
                    onPurchase={onBuyBoostItem}
                    showUnlockAnimation={showUnlockAnimation}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default PremiumStore;
