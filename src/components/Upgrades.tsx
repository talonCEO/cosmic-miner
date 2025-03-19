
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { Coins, ArrowUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Add the missing PASSIVE category
const CATEGORIES = {
  ...UPGRADE_CATEGORIES,
  PASSIVE: 'passive'
};

const Upgrades: React.FC = () => {
  const { state, buyUpgrade, calculateMaxPurchaseAmount } = useGame();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.TAP);

  const upgrades = state.upgrades.filter(upgrade => upgrade.category === selectedCategory && upgrade.unlocked);

  const handleBuyUpgrade = (upgradeId: string, quantity: number) => {
    buyUpgrade(upgradeId, quantity);
  };

  const calculateMaxQuantity = (upgradeId: string): number => {
    return calculateMaxPurchaseAmount(upgradeId);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="flex justify-around p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40">
        <button
          className={`py-2 px-4 rounded-lg transition-colors ${
            selectedCategory === CATEGORIES.TAP
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
          onClick={() => setSelectedCategory(CATEGORIES.TAP)}
        >
          Tap Upgrades
        </button>
        <button
          className={`py-2 px-4 rounded-lg transition-colors ${
            selectedCategory === CATEGORIES.PASSIVE
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
          onClick={() => setSelectedCategory(CATEGORIES.PASSIVE)}
        >
          Passive Upgrades
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {upgrades.map(upgrade => {
          const maxQuantity = calculateMaxQuantity(upgrade.id);
          return (
            <Card key={upgrade.id} className="bg-slate-900 border border-indigo-500/30 text-white">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {upgrade.icon === "coins" && <Coins className="w-4 h-4 text-yellow-400" />}
                    {upgrade.icon === "arrow_up" && <ArrowUp className="w-4 h-4 text-green-400" />}
                    {upgrade.icon === "zap" && <Zap className="w-4 h-4 text-purple-400" />}
                    <h3 className="text-lg font-semibold">{upgrade.name} (Lvl {upgrade.level})</h3>
                  </div>
                  <p className="text-sm text-slate-400">{upgrade.description}</p>
                  <p className="text-sm text-slate-400">
                    {upgrade.coinsPerClickBonus > 0 && `+${formatNumber(upgrade.coinsPerClickBonus)} Tap`}
                    {upgrade.coinsPerSecondBonus > 0 && ` +${formatNumber(upgrade.coinsPerSecondBonus)}/s`}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={state.coins < upgrade.cost || maxQuantity < 1}
                    onClick={() => handleBuyUpgrade(upgrade.id, 1)}
                  >
                    {formatNumber(upgrade.cost)} <Coins className="ml-1 w-4 h-4" />
                  </Button>
                  {maxQuantity > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={state.coins < upgrade.cost * maxQuantity}
                      onClick={() => handleBuyUpgrade(upgrade.id, maxQuantity)}
                      className="mt-1"
                    >
                      Buy Max ({maxQuantity})
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Upgrades;
