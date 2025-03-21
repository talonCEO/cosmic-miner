
import React from "react";
import { useGameContext } from "../context/GameContext";
import PerkButton from "./PerkButton";
import { formatNumber } from "../utils/GameMechanics";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { Trophy, ShoppingCart } from "lucide-react";

const Upgrades = () => {
  const {
    gameState,
    setGameState,
    calculateUpgradeCost,
    calculateIncomePerSecond,
  } = useGameContext();

  const handleUpgrade = (upgradeId: number) => {
    const upgrade = gameState.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const cost = calculateUpgradeCost(upgrade);
    if (gameState.cosmicCredits >= cost) {
      setGameState((prev) => {
        const updatedUpgrades = prev.upgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u
        );

        // Update stats
        return {
          ...prev,
          cosmicCredits: prev.cosmicCredits - cost,
          upgrades: updatedUpgrades,
          stats: {
            ...prev.stats,
            totalUpgradesPurchased: prev.stats.totalUpgradesPurchased + 1,
            lifetimeSpent: prev.stats.lifetimeSpent + cost,
          },
        };
      });

      toast.success(
        `Upgraded ${upgrade.name} to level ${upgrade.level + 1}!`,
        {
          position: "bottom-right",
          duration: 2000,
        }
      );
    } else {
      toast.error("Not enough Cosmic Credits!", {
        position: "bottom-right",
        duration: 2000,
      });
    }
  };

  const toggleAutoBuy = (upgradeId: number) => {
    setGameState((prev) => {
      const updatedUpgrades = prev.upgrades.map((u) =>
        u.id === upgradeId ? { ...u, autoBuy: !u.autoBuy } : u
      );
      return { ...prev, upgrades: updatedUpgrades };
    });
  };

  // Find the most expensive upgrade the user can afford
  const buyBestAffordableUpgrade = () => {
    const affordableUpgrades = gameState.upgrades.filter(
      (upgrade) => calculateUpgradeCost(upgrade) <= gameState.cosmicCredits
    );

    if (affordableUpgrades.length === 0) {
      toast.error("You can't afford any upgrades right now!", {
        position: "bottom-right",
        duration: 2000,
      });
      return;
    }

    // Sort by cost descending and get the most expensive
    const mostExpensiveAffordable = affordableUpgrades.sort(
      (a, b) => calculateUpgradeCost(b) - calculateUpgradeCost(a)
    )[0];

    handleUpgrade(mostExpensiveAffordable.id);
  };

  // Show all upgrades that the player has unlocked
  const unlockedUpgrades = gameState.upgrades.filter(
    (upgrade) => upgrade.level > 0 || calculateUpgradeCost(upgrade) <= gameState.cosmicCredits * 10
  );

  return (
    <div className="w-full h-full flex flex-col space-y-2 p-2">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5" /> Upgrades
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={buyBestAffordableUpgrade}
            className="h-8 bg-emerald-600 hover:bg-emerald-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Best
          </Button>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
        <div className="space-y-2">
          {unlockedUpgrades.map((upgrade) => {
            const cost = calculateUpgradeCost(upgrade);
            const currentIncome = calculateIncomePerSecond(upgrade);
            const nextIncome = upgrade.level > 0 
              ? calculateIncomePerSecond({
                  ...upgrade,
                  level: upgrade.level + 1,
                })
              : upgrade.baseMiningRate;
            const incomeIncrease = nextIncome - currentIncome;

            return (
              <div key={upgrade.id} className="upgrade-item">
                <PerkButton
                  name={upgrade.name}
                  description={`Level ${upgrade.level} • +${formatNumber(
                    incomeIncrease
                  )}/s`}
                  image={upgrade.image}
                  cost={cost}
                  level={upgrade.level}
                  onClick={() => handleUpgrade(upgrade.id)}
                  onToggleAutoBuy={() => toggleAutoBuy(upgrade.id)}
                  autoBuy={upgrade.autoBuy}
                  canAfford={gameState.cosmicCredits >= cost}
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
