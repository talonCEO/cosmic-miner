import React, { useState } from 'react';
import { Sparkles, Gem, X } from 'lucide-react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import GemPackage from './GemPackage';
import BoostItem from './BoostItem';
import { gemPackages } from './types/premiumStore';
import { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { INVENTORY_ITEMS, InventoryItem, isBoostWithCost } from '@/components/menu/types';
import { formatNumber } from '@/utils/gameLogic';
import { InAppPurchaseService } from '@/services/InAppPurchaseService';
import { PassiveIncomeChestsWrapper } from '@/components/PassiveIncomeChest';

const getPlaceholderImage = (itemName: string): string => {
  return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';
};

const PremiumStore: React.FC = () => {
  const { state, addGems, addItem, dispatch, purchaseGems } = useGame();
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
      .filter(item => isBoostWithCost(item))
      .map(item => {
        const purchased = state.boosts[item.id]?.purchased || 0;
        const defaultMaxPurchases = item.id === 'boost-auto-buy' || item.id === 'boost-no-ads' || item.id === 'boost-extended-offline' ? 1 : item.id === 'boost-inventory-expansion' ? 5 : Infinity;
        const maxPurchases = item.maxPurchases !== undefined ? item.maxPurchases : defaultMaxPurchases;
        return { ...item, purchased, maxPurchases, purchasable: state.gems >= item.cost && purchased < maxPurchases };
      });
  }, [state.boosts, state.gems]);

  const groupedItems = useMemo(() => {
    const baseOrder = ['boost-no-ads', 'boost-auto-buy', 'boost-extended-offline', 'boost-inventory-expansion'];
    const hasMaxedItem = baseOrder.slice(0, 3).some(id => {
      const item = boostItems.find(i => i.id === id);
      return item && item.purchased >= item.maxPurchases;
    });

    const sortedPremiumIds = hasMaxedItem
      ? baseOrder.sort((a, b) => {
          const itemA = boostItems.find(i => i.id === a)!;
          const itemB = boostItems.find(i => i.id === b)!;
          const aMaxed = itemA.purchased >= itemA.maxPurchases;
          const bMaxed = itemB.purchased >= itemB.maxPurchases;
          if (aMaxed && !bMaxed) return 1;
          if (!aMaxed && bMaxed) return -1;
          return 0;
        })
      : baseOrder;

    return {
      premiumItems: sortedPremiumIds.map(id => boostItems.find(i => i.id === id)!),
      boosts: [
        { items: boostItems.filter(i => ['boost-cheap-upgrades', 'boost-double-coins', 'boost-essence-boost'].includes(i.id)) },
        { title: "Time Warps", items: boostItems.filter(i => ['boost-time-warp', 'boost-time-warp-12', 'boost-time-warp-24'].includes(i.id)) },
        { title: "Tap Boosts", items: boostItems.filter(i => ['boost-tap-boost', 'boost-critical-chance', 'boost-auto-tap'].includes(i.id)) },
        { title: "Permanent Boosts", items: boostItems.filter(i => ['boost-perma-tap', 'boost-perma-passive', 'boost-random'].includes(i.id)) },
      ],
    };
  }, [boostItems]);

  const showUnlockAnimation = (item: InventoryItem) => {
    setUnlockAnimation({ show: true, item, isGemPackage: false, image: undefined });
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const showGemUnlockAnimation = (amount: number, image: string) => {
    setUnlockAnimation({ show: true, item: null, isGemPackage: true, gemAmount: amount, image });
    setTimeout(() => hideUnlockAnimation(), 3000);
  };

  const hideUnlockAnimation = () => {
    setUnlockAnimation({ show: false, item: null });
  };

  const onBuyGemPackage = async (packageId: string) => {
    const pack = gemPackages.find(p => p.id === packageId);
    if (!pack) return;
    try {
      await InAppPurchaseService.purchaseProduct(packageId);
      await purchaseGems(packageId, pack.amount);
      showGemUnlockAnimation(pack.amount, pack.image);
    } catch (error) {
      console.error('Purchase failed:', error);
      await purchaseGems(packageId, pack.amount);
      showGemUnlockAnimation(pack.amount, pack.image);
    }
  };

  const onBuyBoostItem = (itemId: string, quantity: number) => {
    const item = boostItems.find(i => i.id === itemId);
    if (!item || state.gems < item.cost * quantity || item.purchased >= item.maxPurchases) return;

    addGems(-item.cost * quantity);

    switch (item.id) {
      case 'boost-auto-buy':
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id });
        break;
      case 'boost-no-ads':
        dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'hasNoAds', value: true });
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id });
        break;
      case 'boost-inventory-expansion':
        dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'inventoryCapacity', value: state.inventoryCapacity + 5 * quantity });
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id });
        break;
      case 'boost-extended-offline':
        dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'offlineEarningsMaxDuration', value: 24 * 60 * 60 });
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id });
        break;
      default:
        const inventoryItem = { ...item, quantity };
        addItem(inventoryItem);
        showUnlockAnimation(inventoryItem);
        dispatch({ type: 'ACTIVATE_BOOST', boostId: item.id });
    }
  };

  return (
    <>
      {/* Dialog Header */}
      <DialogHeader className="p-2 border-b border-indigo-500/20 relative">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">Premium Store</DialogTitle>
        </div>
      </DialogHeader>

      {/* Unlock Animation */}
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
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-[-2rem] right-0 text-amber-400 hover:text-amber-500 hover:bg-transparent"
                onClick={hideUnlockAnimation}
              >
                <X size={24} />
              </Button>

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
                    src={
                      unlockAnimation.isGemPackage 
                        ? unlockAnimation.image 
                        : unlockAnimation.item 
                          ? (unlockAnimation.item.icon.props as { src: string }).src
                          : ''
                    }
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
                  {unlockAnimation.isGemPackage ? `${formatNumber(unlockAnimation.gemAmount!)} Gems` : unlockAnimation.item?.name}
                </h2>
                <p className="text-green-400 font-semibold mb-4">
                  {unlockAnimation.isGemPackage ? "Added to your account" : unlockAnimation.item?.description}
                </p>
                <Button
                  className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  onClick={hideUnlockAnimation}
                >
                  Back
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <ScrollArea className="h-[60vh]">
        <div className="p-2 space-y-4">
          {/* Chests Section */}
          <div>
            <h3 className="font-semibold border-b border-amber-500/30 pb-1 mb-2">Reward Chests</h3>
            <PassiveIncomeChestsWrapper />
          </div>

          {/* Gem Packages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">Gem Packages</h3>
              <div className="flex items-center">
                <Gem className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="text-yellow-400 font-bold">{formatNumber(state.gems)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {gemPackages.map(pack => (
                <GemPackage key={pack.id} pack={pack} onPurchase={() => onBuyGemPackage(pack.id)} />
              ))}
            </div>
          </div>

          {/* Boosts Section */}
          <div>
            <h3 className="font-semibold border-b border-amber-500/30 pb-1 mb-2">Boosts</h3>
            {groupedItems.boosts.map((group, index) => (
              <div key={index} className="mb-4">
                {group.title && (
                  <h4 className="text-amber-300 text-sm font-medium mb-1">{group.title}</h4>
                )}
                <div className="grid grid-cols-3 gap-1">
                  {group.items.map(item => (
                    <BoostItem
                      key={item.id}
                      item={item}
                      onPurchase={onBuyBoostItem}
                      showUnlockAnimation={showUnlockAnimation}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Premium Items Section */}
          <div>
            <h3 className="font-semibold border-b border-amber-500/30 pb-1 mb-2">Premium Items</h3>
            <div className="grid grid-cols-3 gap-1">
              {groupedItems.premiumItems.map(item => (
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

      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default PremiumStore;