
import React from 'react';
import { Sparkles, Gem } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20 relative">
        <DialogTitle className="text-xl">Premium Store</DialogTitle>
      </DialogHeader>
      
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
