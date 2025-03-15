
import React, { useState, useEffect } from 'react';
import { Sparkles, Gem, X, Ban, Zap, ArrowUp, Gauge, Clock, Rocket, Bolt, Target, Magnet, Star, Flower, Cloud, Compass } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import GemPackage from './GemPackage';
import BoostItem from './BoostItem';
import { gemPackages, BoostItem as BoostItemType } from './types/premiumStore';
import { useMemo } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { useToast } from '@/components/ui/use-toast';

// Helper function to get placeholder images based on item name
const getPlaceholderImage = (itemName: string): string => {
  // Use a common gem image for all items as a placeholder
  return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';
};

export interface PremiumStoreProps {
  boostItems: BoostItemType[];
  onBuyBoostItem: (itemId: string) => void;
}

const PremiumStore: React.FC<PremiumStoreProps> = ({ 
  boostItems, 
  onBuyBoostItem 
}) => {
  const { profile, updateGems, syncUserData } = useFirebase();
  const { toast } = useToast();
  const [unlockAnimation, setUnlockAnimation] = useState<{
    show: boolean;
    item: BoostItemType | null;
    isGemPackage?: boolean;
    gemAmount?: number;
  }>({
    show: false,
    item: null
  });

  // Calculate when the shop will refresh - 8 hours from the earliest purchased item
  const earliestRefreshTime = useMemo(() => {
    const purchasedItems = boostItems.filter(item => item.purchased && item.refreshTime && !item.isPermanent);
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
      item,
      isGemPackage: false
    });
    
    // Auto-hide the animation after 3 seconds
    setTimeout(() => {
      hideUnlockAnimation();
    }, 3000);
  };

  const showGemUnlockAnimation = (amount: number) => {
    setUnlockAnimation({
      show: true,
      item: null,
      isGemPackage: true,
      gemAmount: amount
    });
    
    // Auto-hide the animation after 3 seconds
    setTimeout(() => {
      hideUnlockAnimation();
    }, 3000);
  };

  const hideUnlockAnimation = () => {
    setUnlockAnimation({
      show: false,
      item: null
    });
  };

  // Get player gems from Firebase profile
  const playerGems = profile?.gems || 0;

  // Map of boost IDs to icons
  const boostIcons = {
    boost_no_ads: <Ban className="w-5 h-5 text-yellow-400" />,
    boost_quantum_accelerator: <Zap className="w-5 h-5 text-yellow-400" />,
    boost_nebula_enhancer: <ArrowUp className="w-5 h-5 text-yellow-400" />,
    boost_cosmic_catalyst: <Gauge className="w-5 h-5 text-yellow-400" />,
    boost_void_extractor: <Clock className="w-5 h-5 text-yellow-400" />,
    boost_supernova_surge: <Star className="w-5 h-5 text-yellow-400" />,
    boost_galactic_magnet: <Magnet className="w-5 h-5 text-yellow-400" />,
    boost_temporal_distortion: <Clock className="w-5 h-5 text-yellow-400" />,
    boost_stellar_fusion: <Bolt className="w-5 h-5 text-yellow-400" />,
    boost_dark_matter_infusion: <Target className="w-5 h-5 text-yellow-400" />,
    boost_asteroid_locator: <Compass className="w-5 h-5 text-yellow-400" />,
    boost_wormhole_generator: <Rocket className="w-5 h-5 text-yellow-400" />
  };

  // Always use this gem image for consistency
  const gemImageUrl = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80';

  // Ensure no ads boost is always first
  const sortedBoostItems = useMemo(() => {
    return boostItems.sort((a, b) => {
      if (a.id === 'boost_no_ads') return -1;
      if (b.id === 'boost_no_ads') return 1;
      return 0;
    }).map(item => ({
      ...item,
      icon: boostIcons[item.id as keyof typeof boostIcons] || <Star className="w-5 h-5 text-yellow-400" />
    }));
  }, [boostItems]);

  // Handle buying gem packages via Google Play
  const handleBuyGemPackage = async (packageId: string, amount: number) => {
    try {
      // In a real implementation with Capacitor, this would use a plugin like
      // @capacitor/google-play-billing or similar to initiate a purchase
      
      console.log(`Initiating Google Play purchase for package: ${packageId}`);
      
      // Update Firebase with the new gem amount
      if (updateGems) {
        await updateGems(amount);
        
        // Also sync all game data
        await syncUserData();
        
        showGemUnlockAnimation(amount);
        
        toast({
          title: "Purchase successful!",
          description: `${amount} gems added to your account`,
          variant: "default",
        });
        
        console.log(`Purchase completed - ${amount} gems added to account`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
    }
  };

  // Handle buying boost items
  const handleBuyBoostItem = async (itemId: string) => {
    const item = boostItems.find(item => item.id === itemId);
    if (!item || !item.purchasable) return;
    
    // Check if player has enough gems
    if (playerGems < item.cost) {
      toast({
        title: "Not enough gems",
        description: "You don't have enough gems to purchase this item",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update Firebase with reduced gem count
      if (updateGems) {
        await updateGems(-item.cost);
        
        // Process the item purchase
        onBuyBoostItem(itemId);
        showUnlockAnimation(item);
        
        // Sync all game data
        await syncUserData();
        
        toast({
          title: "Item purchased!",
          description: `${item.name} has been added to your account`,
          variant: "default",
        });
        
        console.log(`Boost item purchased: ${item.name} for ${item.cost} gems`);
      }
    } catch (error) {
      console.error('Boost purchase failed:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
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
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: 0.1
              }}
            >
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
                      initial={{ x: 0, y: 0, opacity: 0 }}
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
                    src={unlockAnimation.isGemPackage ? gemImageUrl : (unlockAnimation.item ? getPlaceholderImage(unlockAnimation.item.name) : gemImageUrl)}
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
                  {unlockAnimation.isGemPackage 
                    ? `${unlockAnimation.gemAmount} Gems`
                    : unlockAnimation.item?.name}
                </h2>
                <p className="text-green-400 font-semibold mb-8">
                  {unlockAnimation.isGemPackage 
                    ? "Added to your account"
                    : unlockAnimation.item?.effect}
                </p>
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
                  onPurchase={() => handleBuyGemPackage(pack.id, pack.amount)}
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
              {sortedBoostItems.map(item => (
                <BoostItem 
                  key={item.id} 
                  item={item} 
                  playerGems={playerGems}
                  onPurchase={(itemId) => handleBuyBoostItem(itemId)}
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
