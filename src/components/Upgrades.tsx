import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PerkButton from './PerkButton';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Trophy, ShoppingCart } from 'lucide-react';

const Upgrades = () => {
  const {
    state: gameState,
    buyUpgrade,
    calculateTotalCoinsPerSecond,
  } = useGame();

  const handleUpgrade = (upgradeId: string) => {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = upgrade.cost;
    if (gameState.coins >= cost) {
      buyUpgrade(upgradeId);
    }
  };

  const toggleAutoBuy = (upgradeId: string) => {
    // Auto-buy toggle not fully implemented in GameContext; placeholder for now
    console.log(`Toggle auto-buy for ${upgradeId}`);
  };

  const buyBestAffordableUpgrade = () => {
    const affordableUpgrades = gameState.upgrades.filter(
      upgrade => upgrade.cost <= gameState.coins
    );

    if (affordableUpgrades.length === 0) return;

    const mostExpensiveAffordable = affordableUpgrades.sort(
      (a, b) => b.cost - a.cost
    )[0];

    handleUpgrade(mostExpensiveAffordable.id);
  };

  const unlockedUpgrades = gameState.upgrades.filter(
    upgrade => upgrade.level > 0 || upgrade.cost <= gameState.coins * 10
  );

  return (
    <div className='w-full h-full flex flex-col space-y-2 p-2'>
      <div className='w-full flex items-center justify-between'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          <Trophy className='h-5 w-5' /> Upgrades
        </h2>
        <div className='flex gap-2'>
          <Button
            onClick={buyBestAffordableUpgrade}
            className='h-8 bg-emerald-600 hover:bg-emerald-700'
          >
            <ShoppingCart className='h-4 w-4 mr-2' />
            Buy Best
          </Button>
        </div>
      </div>
      <Separator />
      <ScrollArea className='h-[calc(100vh-13rem)] pr-4'>
        <div className='space-y-2'>
          {unlockedUpgrades.map(upgrade => {
            const cost = upgrade.cost;
            const currentState = { ...gameState, upgrades: gameState.upgrades.map(u => u.id === upgrade.id ? { ...u, level: u.level - 1 } : u) };
            const currentIncome = upgrade.level > 0 ? calculateTotalCoinsPerSecond(currentState) : 0;
            const nextIncome = calculateTotalCoinsPerSecond({ ...gameState, upgrades: gameState.upgrades.map(u => u.id === upgrade.id ? { ...u, level: u.level + 1 } : u) });
            const incomeIncrease = nextIncome - currentIncome;

            return (
              <div key={upgrade.id} className='upgrade-item'>
                <PerkButton
                  perk={{
                    id: upgrade.id,
                    name: upgrade.name,
                    description: `Level ${upgrade.level} • +${formatNumber(incomeIncrease)}/s`,
                    cost,
                    effect: { type: 'production', value: incomeIncrease },
                  }}
                  parentId={`upgrade-${upgrade.id}`}
                  onUnlock={() => handleUpgrade(upgrade.id)}
                  canAfford={gameState.coins >= cost}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Upgrades;
