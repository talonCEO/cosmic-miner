
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/context/GameContext';
import { InventoryItem } from './types';

interface BoostItemProps {
  item: InventoryItem & { 
    purchased: number; 
    maxPurchases: number;
    purchasable: boolean;
  };
  onPurchase: (itemId: string) => void;
  showUnlockAnimation: (item: InventoryItem) => void;
}

const BoostItem: React.FC<BoostItemProps> = ({ 
  item, 
  onPurchase, 
  showUnlockAnimation 
}) => {
  const { state, addGems } = useGame();
  const { toast } = useToast();
  const canAfford = state.gems >= item.cost;
  const isMaxed = item.purchased >= item.maxPurchases;
  
  const handlePurchase = () => {
    if (!item.purchasable) {
      toast({
        title: "Not Available",
        description: "This item cannot be purchased.",
        variant: "destructive",
      });
      return;
    }
    
    if (!canAfford) {
      toast({
        title: "Insufficient Gems",
        description: "You don't have enough gems to buy this item.",
        variant: "destructive",
      });
      return;
    }

    if (isMaxed) {
      toast({
        title: "Max Purchases Reached",
        description: "You've purchased the maximum amount of this item.",
        variant: "destructive",
      });
      return;
    }
    
    addGems(-item.cost);
    onPurchase(item.id);
    showUnlockAnimation(item);
  };

  const isPermanentAndPurchased = item.effect?.duration === undefined && item.purchased > 0;

  return (
    <div 
      className={`flex flex-col p-3 rounded-lg border ${
        item.purchasable ? 
          'border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40' : 
          'border-gray-500/30 bg-gradient-to-br from-gray-900/40 to-gray-800/40'
      } ${!item.purchasable || isMaxed ? 'opacity-50' : 'hover:from-amber-900/50 hover:to-yellow-900/50'} transition-colors`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="p-2 rounded-md bg-amber-900/50 text-yellow-400 shrink-0">
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-amber-200 truncate">{item.name}</h3>
          <p className="text-xs text-amber-300/70 line-clamp-2">{item.description}</p>
        </div>
      </div>
      
      <p className="text-xs font-semibold text-green-400 mb-2 line-clamp-2">
        {item.effect ? 
          `${item.effect.type}: ${item.effect.value}${item.effect.duration ? ` (${item.effect.duration}s)` : ''}` : 
          'No effect information'
        }
      </p>
      
      <div className="flex flex-col mt-auto">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-sm font-bold">{item.cost}</span>
          <span className="text-xs text-yellow-400">gems</span>
          {item.maxPurchases !== Infinity && (
            <span className="text-xs text-gray-400 ml-1">({item.purchased}/{item.maxPurchases})</span>
          )}
        </div>
        <Button
          size="sm"
          variant={canAfford ? "default" : "secondary"}
          className={`px-2 py-1 h-auto text-xs w-full ${
            item.purchasable && canAfford && !isMaxed ? 
              'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' : 
              'bg-gray-700'
          }`}
          onClick={handlePurchase}
          disabled={!item.purchasable || !canAfford || isMaxed}
        >
          {isMaxed ? "Maxed" : isPermanentAndPurchased ? "Purchased" : "Purchase"}
        </Button>
      </div>
    </div>
  );
};

export default BoostItem;
