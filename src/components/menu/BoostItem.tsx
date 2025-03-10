
import React from 'react';
import { Button } from "@/components/ui/button";
import { BoostItem as BoostItemType } from './types/premiumStore';
import { useToast } from '@/components/ui/use-toast';

interface BoostItemProps {
  item: BoostItemType;
  playerGems: number;
  onPurchase: (itemId: string) => void;
}

const BoostItem: React.FC<BoostItemProps> = ({ item, playerGems, onPurchase }) => {
  const { toast } = useToast();
  const canAfford = playerGems >= item.cost;
  
  const handlePurchase = () => {
    if (!item.purchasable) {
      toast({
        title: "Item Unavailable",
        description: "This item will become available again after the shop refreshes.",
        variant: "destructive",
      });
      return;
    }
    
    if (!canAfford) {
      toast({
        title: "Not Enough Gems",
        description: `You need ${item.cost - playerGems} more gems to purchase this item.`,
        variant: "destructive",
      });
      return;
    }
    
    onPurchase(item.id);
    
    toast({
      title: `${item.name} Activated!`,
      description: `${item.effect} has been applied to your game.`,
    });
  };

  return (
    <div 
      className={`flex flex-col p-3 rounded-lg border ${
        item.purchasable ? 
          'border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40' : 
          'border-gray-500/30 bg-gradient-to-br from-gray-900/40 to-gray-800/40'
      } ${!item.purchasable ? 'opacity-50' : 'hover:from-amber-900/50 hover:to-yellow-900/50'} transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-amber-900/50 text-yellow-400">
          {item.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-200">{item.name}</h3>
          <p className="text-xs text-amber-300/70 mb-1">{item.description}</p>
          <p className="text-xs font-semibold text-green-400 mb-1">{item.effect}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm font-bold">{item.cost}</span>
          <span className="text-xs text-yellow-400">gems</span>
        </div>
        <Button
          size="sm"
          variant={canAfford ? "default" : "secondary"}
          className={`px-2 py-1 h-auto ${
            item.purchasable && canAfford ? 
              'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' : 
              'bg-gray-700'
          }`}
          onClick={handlePurchase}
          disabled={!item.purchasable || !canAfford}
        >
          {item.purchased ? "Purchased" : "Purchase"}
        </Button>
      </div>
    </div>
  );
};

export default BoostItem;
