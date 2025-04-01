import React, { useState } from 'react';
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
  onPurchase: (itemId: string, quantity: number) => void;
  showUnlockAnimation: (item: InventoryItem) => void;
}

const BoostItem: React.FC<BoostItemProps> = ({ 
  item, 
  onPurchase, 
  showUnlockAnimation 
}) => {
  const { state } = useGame();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const cost = (item.cost || 0) * quantity;
  const canAfford = state.gems >= cost;
  const isMaxed = item.purchased >= (item.maxPurchases || Infinity);
  const maxPurchasable = Math.min(
    Math.floor(state.gems / (item.cost || 1)),
    (item.maxPurchases || Infinity) - item.purchased
  );

  const handlePurchase = () => {
    if (!item.purchasable) {
      toast({ title: "Not Available", description: "This item cannot be purchased.", variant: "destructive" });
      return;
    }
    if (!canAfford) {
      toast({ title: "Insufficient Gems", description: "You don't have enough gems.", variant: "destructive" });
      return;
    }
    if (isMaxed) {
      toast({ title: "Max Purchases Reached", description: "You've reached the maximum.", variant: "destructive" });
      return;
    }
    onPurchase(item.id, quantity);
    showUnlockAnimation({ ...item, quantity });
    setQuantity(1); // Reset after purchase
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxPurchasable, prev + delta)));
  };

  const isPermanentAndPurchased = item.effect && item.effect.duration === undefined && item.purchased > 0;

  return (
    <div className="flex flex-col p-2 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 w-full transition-colors hover:from-amber-900/50 hover:to-yellow-900/50">
      {/* Item Image */}
      <div className="flex justify-center mb-1">
        <div className="w-12 h-12 rounded-md bg-amber-900/50 flex items-center justify-center">
          {item.icon} {/* Render the ReactNode directly */}
        </div>
      </div>

      {/* Name and Description */}
      <h3 className="text-xs font-medium text-amber-200 text-center truncate">{item.name}</h3>
      <p className="text-[10px] text-amber-300/70 text-center mt-1 line-clamp-2 min-h-[2em]">{item.description}</p>

      {/* Effect */}
      <p className="text-[10px] font-semibold text-green-400 text-center mt-1 line-clamp-2 min-h-[2em]">
        {item.effect ? `${item.effect.type}: ${item.effect.value}${item.effect.duration ? ` (${item.effect.duration}s)` : ''}` : 'No effect'}
      </p>

      {/* Cost and Purchase Info */}
      <div className="flex flex-col items-center mt-2">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-400 text-xs font-bold">{cost}</span>
          <span className="text-[10px] text-yellow-400">gems</span>
          {item.maxPurchases !== Infinity && (
            <span className="text-[10px] text-gray-400 ml-1">({item.purchased}/{item.maxPurchases})</span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-1 mb-1">
          <Button
            size="sm"
            variant="outline"
            className="w-6 h-6 p-0 bg-amber-700 text-white text-xs"
            onClick={() => adjustQuantity(-1)}
            disabled={quantity <= 1 || isMaxed || !item.purchasable}
          >
            -
          </Button>
          <span className="text-xs text-amber-200 font-semibold w-8 text-center">{quantity}</span>
          <Button
            size="sm"
            variant="outline"
            className="w-6 h-6 p-0 bg-amber-700 text-white text-xs"
            onClick={() => adjustQuantity(1)}
            disabled={quantity >= maxPurchasable || isMaxed || !item.purchasable}
          >
            +
          </Button>
        </div>

        {/* Purchase Button */}
        <Button
          size="sm"
          variant={canAfford ? "default" : "secondary"}
          className={`w-full h-6 text-[10px] ${canAfford && !isMaxed ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' : 'bg-gray-700'}`}
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