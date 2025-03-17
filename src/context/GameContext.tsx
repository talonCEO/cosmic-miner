
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdContext } from './AdContext';

export interface GameContextType {
  coins: number;
  gems: number;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  totalPassiveIncome: number;
  setTotalPassiveIncome: (income: number) => void;
  clickPower: number;
  setClickPower: (power: number) => void;
  prestigeLevel: number;
  setPrestigeLevel: (level: number) => void;
  prestigeMultiplier: number;
  setPrestigeMultiplier: (multiplier: number) => void;
  formatNumber: (number: number) => string;
  totalCoinsEarned: number;
  setTotalCoinsEarned: (coins: number) => void;
  totalTaps: number;
  setTotalTaps: (taps: number) => void;
  incomeMultiplier: number;
  setIncomeMultiplier: (multiplier: number) => void;
  tapPowerMultiplier: number;
  setTapPowerMultiplier: (multiplier: number) => void;
  addGems: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [totalPassiveIncome, setTotalPassiveIncome] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [incomeMultiplier, setIncomeMultiplier] = useState(1);
  const [tapPowerMultiplier, setTapPowerMultiplier] = useState(1);
  const { toast } = useToast();
  const { isBoostActive } = useAdContext();

  useEffect(() => {
    if (isBoostActive) {
      toast({
        title: "Boost Active",
        description: "Your income boost is active!",
      });
    }
  }, [isBoostActive, toast]);

  const addCoins = (amount: number) => {
    setCoins((prevCoins) => prevCoins + amount);
    setTotalCoinsEarned((prevTotal) => prevTotal + amount);
  };

  const removeCoins = (amount: number) => {
    setCoins((prevCoins) => {
      const newCoins = prevCoins - amount;
      return newCoins < 0 ? 0 : newCoins;
    });
  };

  const addGems = (amount: number) => {
    setGems(prevGems => prevGems + amount);
  };

  const formatNumber = (number: number) => {
    const formatter = Intl.NumberFormat(undefined, {
      notation: "compact",
      compactDisplay: "short",
    });
    return formatter.format(number);
  };

  return (
    <GameContext.Provider value={{
      coins,
      gems,
      addCoins,
      removeCoins,
      totalPassiveIncome,
      setTotalPassiveIncome,
      clickPower,
      setClickPower,
      prestigeLevel,
      setPrestigeLevel,
      prestigeMultiplier,
      setPrestigeMultiplier,
      formatNumber,
      totalCoinsEarned,
      setTotalCoinsEarned,
      totalTaps,
      setTotalTaps,
      incomeMultiplier,
      setIncomeMultiplier,
      tapPowerMultiplier,
      setTapPowerMultiplier,
      addGems,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
