
import React, { useState } from 'react';
import { Sparkles, Gem, X } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import GemPackage from './GemPackage';
import BoostItem from './BoostItem';
import { gemPackages, BoostItem as BoostItemType } from './types/premiumStore';
import { useMemo } from 'react';

interface PremiumStoreProps {
  playerGems: number;
  boostItems: BoostItemType[];
  onBuyGemPackage: (packageId: string, amount: number) => void;
  onBuyBoostItem: (itemId: string) => void;
}

const PremiumStore: React.FC<PremiumStoreProps> = ({ 
  playerGems, 
  boostItems, 
  onBuyGemPackage, 
  onBuyBoostItem 
}) => {
  const [unlockAnimation, setUnlockAnimation] = useState<{
    show: boolean;
    item: BoostItemType | null;
  }>({
    show: false,
    item: null
  });

  // Calculate when the shop will refresh - 8 hours from the earliest purchased item
  const earliestRefreshTime = useMemo(() => {
    const purchasedItems = boostItems.filter(item => item.purchased && item.refreshTime);
    if (purchasedItems.length === 0) return null;
    
    const times = purchasedItems
      .map(item => item.refreshTime || 0)
      .sort((a, b) => a - b);
    
    return times[0];
  }, [boostItems]);
  
  // Format the next refresh time
  const formattedRefreshTime = useMemo(() => {
    if (!earliestRefreshTime) return null;
    
    const now = Date.now();
    const timeDiff = earliestRefreshTime - now;
    
    if (timeDiff <= 0) {
      // Shop should refresh now
      return "Ready to refresh";
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [earliestRefreshTime]);

  const showUnlockAnimation = (item: BoostItemType) => {
    setUnlockAnimation({
      show: true,
      item
    });
  };

  const hideUnlockAnimation = () => {
    setUnlockAnimation({
      show: false,
      item: null
    });
  };

  // Generate placeholder image URL based on item name
  const getPlaceholderImage = (itemName: string) => {
    // Use different placeholder images for variety
    const imageOptions = [
      'photo-1488590528505-98d2b5aba04b',
      'photo-1518770660439-4636190af475',
      'photo-1461749280684-dccba630e2f6'
    ];
    
    // Deterministically choose an image based on the item name
    const index = itemName.length % imageOptions.length;
    return `https://images.unsplash.com/${imageOptions[index]}?auto=format&fit=crop&w=400&h=400&q=80`;
  };

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20 relative">
        <DialogTitle className="text-xl">Premium Store</DialogTitle>
      </DialogHeader>
      
      <AnimatePresence>
        {unlockAnimation.show && unlockAnimation.item && (
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
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: 0.1
              }}
            >
              {/* Placeholder image */}
              <div className="relative">
                {/* Glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Particle effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-amber-400"
                      initial={{ 
                        x: 0, 
                        y: 0,
                        opacity: 0
                      }}
                      animate={{ 
                        x: Math.cos(i * 30 * (Math.PI / 180)) * 100, 
                        y: Math.sin(i * 30 * (Math.PI / 180)) * 100,
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.5 + (i % 3) * 0.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeOut",
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
                
                <motion.div
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg shadow-amber-500/50 z-10 relative"
                  animate={{ 
                    boxShadow: ["0 0 20px 0px #f59e0b50", "0 0 40px 10px #f59e0b80", "0 0 20px 0px #f59e0b50"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <img 
                    src={getPlaceholderImage(unlockAnimation.item.name)} 
                    alt={unlockAnimation.item.name}
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
                  {unlockAnimation.item.name}
                </h2>
                <p className="text-green-400 font-semibold mb-8">
                  {unlockAnimation.item.effect}
                </p>
                
                <motion.div 
                  className="p-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={hideUnlockAnimation}
                    className="bg-slate-900 hover:bg-slate-800 w-32"
                  >
                    Close
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="h-[60vh]">
        <div className="p-4">
          {/* Section 1: Gem Packages */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">
                Gem Packages
              </h3>
              <div className="flex items-center">
                <Gem className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="text-yellow-400 font-bold">{playerGems}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {gemPackages.map(pack => (
                <GemPackage 
                  key={pack.id} 
                  pack={pack} 
                  onPurchase={() => onBuyGemPackage(pack.id, pack.amount)}
                />
              ))}
            </div>
          </div>
          
          {/* Section 2: Boost Items */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold border-b border-amber-500/30 pb-1">
                Boost Items
              </h3>
            </div>
            
            {formattedRefreshTime && (
              <div className="flex items-center justify-end mb-3">
                <span className="text-xs text-gray-400">Refreshes in: {formattedRefreshTime}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              {boostItems.map(item => (
                <BoostItem 
                  key={item.id} 
                  item={item} 
                  playerGems={playerGems}
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
