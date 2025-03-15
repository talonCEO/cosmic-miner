
import React from 'react';
import { Button } from "@/components/ui/button";
import { BoostItem as BoostItemType } from './types/premiumStore';
import { useToast } from '@/components/ui/use-toast';

interface BoostItemProps {
  item: BoostItemType;
  playerGems: number;
  onPurchase: (itemId: string) => void;
  showUnlockAnimation: (item: BoostItemType) => void;
}

const BoostItem: React.FC<BoostItemProps> = ({ 
  item, 
  playerGems, 
  onPurchase, 
  showUnlockAnimation 
}) => {
  const { toast } = useToast();
  const canAfford = playerGems >= item.cost;
  
  const handlePurchase = () => {
    if (!item.purchasable) {
      return;
    }
    
    if (!canAfford) {
      return;
    }
    
    onPurchase(item.id);
    showUnlockAnimation(item);
  };

  // For permanent items that have been purchased
  const isPermanentAndPurchased = item.isPermanent && item.purchased;

  return (
    <div 
      className={`flex flex-col p-3 rounded-lg border ${
        item.purchasable ? 
          'border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40' : 
          'border-gray-500/30 bg-gradient-to-br from-gray-900/40 to-gray-800/40'
      } ${!item.purchasable || isPermanentAndPurchased ? 'opacity-50' : 'hover:from-amber-900/50 hover:to-yellow-900/50'} transition-colors`}
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
      
      <p className="text-xs font-semibold text-green-400 mb-2 line-clamp-2">{item.effect}</p>
      
      <div className="flex flex-col mt-auto">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-sm font-bold">{item.cost}</span>
          <span className="text-xs text-yellow-400">gems</span>
        </div>
        <Button
          size="sm"
          variant={canAfford ? "default" : "secondary"}
          className={`px-2 py-1 h-auto text-xs w-full ${
            item.purchasable && canAfford && !isPermanentAndPurchased ? 
              'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' : 
              'bg-gray-700'
          }`}
          onClick={handlePurchase}
          disabled={!item.purchasable || !canAfford || isPermanentAndPurchased}
        >
          {isPermanentAndPurchased ? "Purchased" : 
            item.purchased ? "Purchased" : "Purchase"}
        </Button>
      </div>
    </div>
  );
};

export default BoostItem;
