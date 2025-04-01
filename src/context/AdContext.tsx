// src/context/AdContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { adMobService } from '@/services/AdMobService';
import * as GameMechanics from '@/utils/GameMechanics';
import { Capacitor } from '@capacitor/core';

interface AdContextType {
  showAdNotification: boolean;
  adBoostActive: boolean;
  adBoostTimeRemaining: number;
  adBoostMultiplier: number;
  handleWatchAd: (isChestReward?: boolean) => Promise<boolean>;
  dismissAdNotification: () => void;
  selectedAdType: 'income' | 'gems' | 'timeWarp';
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, setIncomeMultiplier, addGems, applyTimeWarp } = useGame();
  const { toast } = useToast();

  const [showAdNotification, setShowAdNotification] = useState(false);
  const [adBoostActive, setAdBoostActive] = useState(false);
  const [adBoostTimeRemaining, setAdBoostTimeRemaining] = useState(0);
  const [lastAdWatchedTime, setLastAdWatchedTime] = useState(0);
  const [nextAdTime, setNextAdTime] = useState(0);
  const [adNotificationStartTime, setAdNotificationStartTime] = useState(0);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState<'income' | 'gems' | 'timeWarp'>('income');

  const adBoostMultiplier = 2;
  const adBoostDuration = 10 * 60;
  const minAdInterval = 5 * 60;
  const maxAdInterval = 15 * 60;
  const cooldownPeriod = 60;
  const adNotificationDuration = 60;
  const initialAdDelay = 90;

  const adTypes = ['income', 'gems', 'timeWarp'] as const;

  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        const interstitialLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(interstitialLoaded);
        const rewardedLoaded = await adMobService.loadRewardedAd();
        setIsRewardedAdLoaded(rewardedLoaded);
        setNextAdTime(Date.now() + initialAdDelay * 1000);
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };

    initAds();
  }, []);

  useEffect(() => {
    if (!nextAdTime) {
      const initialDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, []);

  useInterval(() => {
    const now = Date.now();

    if (
      !showAdNotification &&
      now >= nextAdTime &&
      now - lastAdWatchedTime >= cooldownPeriod * 1000 &&
      !adBoostActive
    ) {
      const randomType = adTypes[Math.floor(Math.random() * adTypes.length)];
      setSelectedAdType(randomType);
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      console.log(`Showing ad notification: ${randomType}`);

      if (!isRewardedAdLoaded) {
        adMobService.loadRewardedAd()
          .then(success => setIsRewardedAdLoaded(success))
          .catch(err => console.error('Failed to load rewarded ad', err));
      }
    }

    if (showAdNotification && now - adNotificationStartTime >= adNotificationDuration * 1000) {
      dismissAdNotification();
      console.log('Auto-dismissing ad notification');
    }

    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      if (adBoostTimeRemaining === 1) {
        setAdBoostActive(false);
        setIncomeMultiplier(1.0);
      }
    }
  }, 1000);

  const handleWatchAd = async (isChestReward: boolean = false): Promise<boolean> => {
    if (adBoostActive && selectedAdType === 'income' && !isChestReward) {
      setShowAdNotification(false);
      return true;
    }

    setShowAdNotification(false);

    try {
      if (state.hasNoAds || Capacitor.getPlatform() === 'web') {
        if (!isChestReward) {
          switch (selectedAdType) {
            case 'income':
              setAdBoostActive(true);
              setAdBoostTimeRemaining(adBoostDuration);
              setIncomeMultiplier(adBoostMultiplier);
              toast({
                title: "2x Income Boost Activated!",
                description: `You've earned a ${adBoostMultiplier}x income boost for 10 minutes!`,
                variant: "default",
              });
              break;
            case 'gems':
              addGems(20);
              toast({
                title: "Gems Bonus Claimed!",
                description: "You've received 20 bonus gems!",
                variant: "default",
              });
              break;
            case 'timeWarp':
              const passiveIncome = GameMechanics.calculatePassiveIncome(state) * 3600;
              applyTimeWarp(passiveIncome);
              toast({
                title: "Time Warp Activated!",
                description: "You've earned 60 minutes of passive income!",
                variant: "default",
              });
              break;
          }
        }
        setLastAdWatchedTime(Date.now());
        const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
        setNextAdTime(Date.now() + nextDelay * 1000);
        return true;
      } else {
        if (!isRewardedAdLoaded) {
          const adLoaded = await adMobService.loadRewardedAd();
          setIsRewardedAdLoaded(adLoaded);
          if (!adLoaded) {
            throw new Error("Failed to load rewarded ad");
          }
        }

        const reward = await adMobService.showRewardedAd();
        setIsRewardedAdLoaded(false);

        if (reward && !isChestReward) {
          switch (selectedAdType) {
            case 'income':
              setAdBoostActive(true);
              setAdBoostTimeRemaining(adBoostDuration);
              setIncomeMultiplier(adBoostMultiplier);
              toast({
                title: "2x Income Boost Activated!",
                description: `You've earned a ${adBoostMultiplier}x income boost for 10 minutes!`,
                variant: "default",
              });
              break;
            case 'gems':
              addGems(20);
              toast({
                title: "Gems Bonus Claimed!",
                description: "You've received 20 bonus gems!",
                variant: "default",
              });
              break;
            case 'timeWarp':
              const passiveIncome = GameMechanics.calculatePassiveIncome(state) * 3600;
              applyTimeWarp(passiveIncome);
              toast({
                title: "Time Warp Activated!",
                description: "You've earned 60 minutes of passive income!",
                variant: "default",
              });
              break;
          }
        }

        adMobService.loadRewardedAd()
          .then(success => setIsRewardedAdLoaded(success))
          .catch(err => console.error('Failed to load next rewarded ad', err));

        setLastAdWatchedTime(Date.now());
        const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
        setNextAdTime(Date.now() + nextDelay * 1000);
        return reward;
      }
    } catch (error) {
      console.error("Error handling ad:", error);
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
      return false;
    }
  };

  const dismissAdNotification = () => {
    setShowAdNotification(false);
    const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
    setNextAdTime(Date.now() + nextDelay * 1000);
  };

  return (
    <AdContext.Provider value={{
      showAdNotification,
      adBoostActive,
      adBoostTimeRemaining,
      adBoostMultiplier,
      handleWatchAd,
      dismissAdNotification,
      selectedAdType,
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = (): AdContextType => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};