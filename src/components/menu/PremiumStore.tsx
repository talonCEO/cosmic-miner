import React, { useState } from 'react';
import { Sparkles, Gem, X, Ban, Zap, ArrowUp, Gauge, Clock, Rocket, Bolt, Target, Magnet, Star, Flower, Cloud, Compass, Percent, VideoOff, PackagePlus, Box, DollarSign } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import GemPackage from './GemPackage';
import BoostItem, { BoostItemType } from './BoostItem';
import { gemPackages, PremiumStoreProps } from './types/premiumStore';
import { useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';

const getPlaceholderImage = (itemName: string): string => {
  return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';
};

const PremiumStore: React.FC<PremiumStoreProps> = ({ 
  playerGems = 0, 
  boostItems = [], 
  onBuyGemPackage, 
  onBuyBoostItem 
}) => {
  const { state, addGems, addItem } = useGame();
  const [unlockAnimation, setUnlockAnimation] = useState<{
    show: boolean;
    item: BoostItemType | null;
    isGemPackage?: boolean;
    gemAmount?: number;
    image?: string;
  }>({
    show: false,
    item: null,
  });

  const showUnlockAnimation = (item: BoostItemType) => {
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

  const boostIcons = {
    'boost-double-coins': <DollarSign className="w-5 h-5 text-green-400" />,
    'boost-time-warp': <Clock className="w-5 h-5 text-blue-400" />,
    'boost-auto-tap': <Zap className="w-5 h-5 text-yellow-400" />,
    'boost-tap-boost': <Zap className="w-5 h-5 text-purple-400" />,
    'boost-cheap-upgrades': <Percent className="w-5 h-5 text-green-400" />,
    'boost-essence-boost': <Sparkles className="w-5 h-5 text-amber-400" />,
    'boost-perma-tap': <DollarSign className="w-5 h-5 text-red-400" />,
    'boost-perma-passive': <Star className="w-5 h-5 text-yellow-400" />,
    'boost-no-ads': <VideoOff className="w-5 h-5 text-gray-400" />,
    'boost-auto-buy': <PackagePlus className="w-5 h-5 text-blue-400" />,
    'boost-inventory-expansion': <Box className="w-5 h-5 text-cyan-400" />,
  };

  const availableBoostItems = useMemo(() => {
    return Object.values(INVENTORY_ITEMS)
      .filter(item => item.type === 'boost')
      .map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        effect: item.effect ? `${item.effect.type} (Value: ${item.effect.value})` : item.description,
        cost: item.cost || 100,
        icon: boostIcons[item.id as keyof typeof boostIcons] || <Star className="w-5 h-5 text-yellow-400" />,
        purchasable: state.gems >= (item.cost || 100),
        purchased: state.boosts ? (state.boosts[item.id]?.purchased || 0) : 0,
        isPermanent: item.stackable === false,
        maxPurchases: item.maxPurchases || Infinity,
      })) as BoostItemType[];
  }, [state.gems, state.boosts]);

  const sortedBoostItems = useMemo(() => {
    const priorityOrder = ['boost-no-ads', 'boost-auto-buy', 'boost-inventory-expansion'];
    return [...availableBoostItems].sort((a, b) => {
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
  }, [availableBoostItems]);

  const handleBuyBoostItem = (itemId: string) => {
    const item = sortedBoostItems.find(i => i.id === itemId);
    if (!item || state.gems < item.cost || item.purchased >= item.maxPurchases) return;

    addGems(-item.cost);
    
    const originalItem = Object.values(INVENTORY_ITEMS).find(i => i.id === itemId);
    if (originalItem) {
      addItem(createInventoryItem(originalItem));
    }
    
    if (onBuyBoostItem) {
      onBuyBoostItem(itemId);
    }
    
    showUnlockAnimation(item);
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
                <BoostItem 
                  key={item.id} 
                  item={item}
                  onPurchase={handleBuyBoostItem}
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
