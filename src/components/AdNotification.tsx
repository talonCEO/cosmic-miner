
import React from 'react';
import { useAdContext, BoostType } from '../context/AdContext';
import { Gem, Clock, Zap, Coins } from 'lucide-react';

const AdNotification = () => {
  const { isBoostActive, activeBoostType, boostTimeRemaining } = useAdContext();

  if (!isBoostActive || !activeBoostType) return null;

  const getBoostIcon = (boostType: BoostType) => {
    switch (boostType) {
      case 'income':
        return <Coins className="h-5 w-5 text-yellow-500" />;
      case 'gems':
        return <Gem className="h-5 w-5 text-blue-500" />;
      case 'timeWarp':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'tapPower':
        return <Zap className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getBoostLabel = (boostType: BoostType) => {
    switch (boostType) {
      case 'income':
        return '2x Income Boost';
      case 'gems':
        return 'Gems Received';
      case 'timeWarp':
        return 'Time Warp';
      case 'tapPower':
        return '5x Tap Power';
      default:
        return 'Boost Active';
    }
  };

  // Only show a timer notification for timed boosts
  if (activeBoostType === 'income' || activeBoostType === 'tapPower') {
    return (
      <div className="fixed top-16 right-4 bg-black/80 text-white px-3 py-2 rounded-lg z-50 flex items-center space-x-2 animate-fade-in">
        {getBoostIcon(activeBoostType)}
        <span>{getBoostLabel(activeBoostType)}: {boostTimeRemaining}s</span>
      </div>
    );
  }
  
  return null;
};

export default AdNotification;
