// src/components/PassiveIncomeChest.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAd } from '@/context/AdContext';
import { INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';

// Sprites for each chest variant
import SmallChestClosed from '@/assets/images/icons/chest1.png';
import SmallChestOpening from '@/assets/images/icons/chest3.png';
import MediumChestClosed from '@/assets/images/icons/chest7.png';
import MediumChestOpening from '@/assets/images/icons/chest8.png';
import LargeChestClosed from '@/assets/images/icons/chest4.png';
import LargeChestOpening from '@/assets/images/icons/chest5.png';

interface PassiveIncomeChestProps {
  type: 'timeWarp' | 'boost' | 'gems';
  chestId: string;
  name: string;
}

const PassiveIncomeChest: React.FC<PassiveIncomeChestProps> = ({ type, chestId, name }) => {
  const { addItem, addGems } = useGame();
  const { handleWatchAd } = useAd();
  const [chestState, setChestState] = useState<'closed' | 'opening'>('closed');
  const [lastOpened, setLastOpened] = useState<number>(() => {
    const saved = localStorage.getItem(`passiveChestLastOpened_${chestId}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    timeWarp: {
      cooldown: 6 * 60 * 60 * 1000, // 6 hours
      reward: () => addItem(createInventoryItem(INVENTORY_ITEMS.TIME_WARP, 1)),
      sprites: { closed: SmallChestClosed, opening: SmallChestOpening },
    },
    boost: {
      cooldown: 24 * 60 * 60 * 1000, // 24 hours
      reward: () => {
        const boostItems = [
          INVENTORY_ITEMS.AUTO_TAP,
          INVENTORY_ITEMS.CHEAP_UPGRADES,
          INVENTORY_ITEMS.TAP_BOOST,
          INVENTORY_ITEMS.CRITICAL_CHANCE,
          INVENTORY_ITEMS.TIME_WARP,
          INVENTORY_ITEMS.ESSENCE_BOOST,
          INVENTORY_ITEMS.PERMA_TAP,
          INVENTORY_ITEMS.PERMA_PASSIVE,
        ].filter(item => item.id !== 'boost-double-coins');
        const randomItem = boostItems[Math.floor(Math.random() * boostItems.length)];
        addItem(createInventoryItem(randomItem, 1));
      },
      sprites: { closed: MediumChestClosed, opening: MediumChestOpening },
    },
    gems: {
      cooldown: 7 * 24 * 60 * 60 * 1000, // 7 days
      reward: () => addGems(50 + Math.floor(Math.random() * 151)),
      sprites: { closed: LargeChestClosed, opening: LargeChestOpening },
    },
  }[type];

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const timeSinceLast = now - lastOpened;
      const remaining = Math.max(0, config.cooldown - timeSinceLast);
      setTimeRemaining(remaining);

      if (timeSinceLast >= config.cooldown && chestState !== 'closed') {
        setChestState('closed');
        setIsProcessing(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastOpened, chestState, config.cooldown]);

  const handleChestClick = async () => {
    if (chestState !== 'closed' || timeRemaining > 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const adWatched = await handleWatchAd(true); // Pass true to indicate chest reward
      if (adWatched) {
        setChestState('opening');
        setTimeout(() => {
          config.reward();
          const now = Date.now();
          setLastOpened(now);
          localStorage.setItem(`passiveChestLastOpened_${chestId}`, now.toString());
          setChestState('closed');
          setIsProcessing(false);
        }, 1000);
      } else {
        throw new Error('Ad not completed');
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      setChestState('closed');
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    if (days > 0) {
      return `${days}d ${remainingHours}h ${remainingMinutes}m`;
    }
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  const getChestSprite = () => config.sprites[chestState];

  return (
    <div className="w-full flex flex-col items-center p-4 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 transition-colors hover:from-amber-900/50 hover:to-yellow-900/50">
      <img
        src={getChestSprite()}
        alt={`${name}`}
        className={`w-16 h-16 mb-2 object-contain ${chestState === 'closed' && timeRemaining === 0 ? 'cursor-pointer' : 'opacity-50'}`}
        onClick={handleChestClick}
      />
      <h3 className="text-sm font-medium text-amber-200 mb-1">{name}</h3>
      {timeRemaining > 0 ? (
        <span className="text-[10px] text-yellow-400">
          Refresh: {formatTime(timeRemaining)}
        </span>
      ) : (
        <span className="text-[10px] text-green-400">Ready!</span>
      )}
    </div>
  );
};

export const PassiveIncomeChestsWrapper: React.FC = () => (
  <div className="grid grid-cols-3 gap-1 w-full">
    <PassiveIncomeChest type="timeWarp" chestId="timeWarpChest" name="Hourglass Chest" />
    <PassiveIncomeChest type="boost" chestId="boostChest" name="Crescent Cache" />
    <PassiveIncomeChest type="gems" chestId="gemsChest" name="Weekly Windfall" />
  </div>
);

export default PassiveIncomeChest;