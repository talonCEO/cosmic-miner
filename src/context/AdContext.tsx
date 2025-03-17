
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { adMobService } from '@/services/AdMobService';

interface AdContextType {
  showAdNotification: boolean;
  adBoostActive: boolean;
  adBoostTimeRemaining: number;
  adBoostMultiplier: number;
  handleWatchAd: () => Promise<void>;
  dismissAdNotification: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, setIncomeMultiplier } = useGame();
  const { toast } = useToast();
  
  const [showAdNotification, setShowAdNotification] = useState(false);
  const [adBoostActive, setAdBoostActive] = useState(false);
  const [adBoostTimeRemaining, setAdBoostTimeRemaining] = useState(0);
  const [lastAdWatchedTime, setLastAdWatchedTime] = useState(0);
  const [nextAdTime, setNextAdTime] = useState(0);
  const [adNotificationStartTime, setAdNotificationStartTime] = useState(0);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isRewardedAdLoaded, setIsRewardedAdLoaded] = useState(false);
  
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 60; // 60 seconds minimum between ads
  const adNotificationDuration = 60; // 1 minute auto-dismiss
  const initialAdDelay = 90; // Delay first ad by 90 seconds (1.5 minutes)
  
  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        
        // Load both interstitial and rewarded ads
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
    
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000 && !adBoostActive) {
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      console.log('Showing ad notification');
      
      // Make sure rewarded ad is loaded
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
  
  const handleWatchAd = async () => {
    if (adBoostActive) {
      setShowAdNotification(false);
      return;
    }
    
    setShowAdNotification(false);
    
    try {
      if (!isRewardedAdLoaded) {
        const adLoaded = await adMobService.loadRewardedAd();
        setIsRewardedAdLoaded(adLoaded);
        if (!adLoaded) {
          throw new Error("Failed to load rewarded ad");
        }
      }
      
      // Show rewarded ad instead of interstitial
      const reward = await adMobService.showRewardedAd();
      setIsRewardedAdLoaded(false);
      
      // When ad completes successfully and user earns the reward
      if (reward) {
        setAdBoostActive(true);
        setAdBoostTimeRemaining(adBoostDuration);
        setIncomeMultiplier(adBoostMultiplier);
        
        toast({
          title: "2x Income Boost Activated!",
          description: `You've earned a ${adBoostMultiplier}x income boost for 10 minutes!`,
          variant: "default",
        });
      }
      
      // Preload the next rewarded ad
      adMobService.loadRewardedAd()
        .then(success => setIsRewardedAdLoaded(success))
        .catch(err => console.error('Failed to load next rewarded ad', err));
      
      setLastAdWatchedTime(Date.now());
      
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
    } catch (error) {
      console.error("Error showing rewarded ad:", error);
      
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
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
      dismissAdNotification
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
