
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { adMobService } from '@/services/AdMobService';
import { Plus, PlayCircle, Clock, Zap, MousePointerClick } from 'lucide-react';

// Define the different boost types
export type BoostType = 'income' | 'autoTap' | 'timeWarp';

// Define the boost configuration interface
interface BoostConfig {
  type: BoostType;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in seconds, 0 means instant effect
  multiplier?: number; // for income boost
  clicksPerSecond?: number; // for auto tap boost
  timeSkip?: number; // for time warp (in seconds)
}

interface AdContextType {
  showAdNotification: boolean;
  adBoostActive: boolean;
  adBoostTimeRemaining: number;
  adBoostMultiplier: number;
  activeBoostType: BoostType | null;
  currentBoostConfig: BoostConfig | null;
  handleWatchAd: () => Promise<void>;
  dismissAdNotification: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Boost configurations
const boostConfigs: BoostConfig[] = [
  {
    type: 'income',
    name: 'Income Boost',
    description: '2x Income for 10min',
    icon: <Plus className="h-3 w-3" />,
    duration: 10 * 60, // 10 minutes in seconds
    multiplier: 2
  },
  {
    type: 'autoTap',
    name: 'Auto Tap',
    description: 'Auto tap 5 times/sec for 2min',
    icon: <MousePointerClick className="h-3 w-3" />,
    duration: 2 * 60, // 2 minutes in seconds
    clicksPerSecond: 5
  },
  {
    type: 'timeWarp',
    name: 'Time Warp',
    description: 'Skip ahead 30min of income',
    icon: <Clock className="h-3 w-3" />,
    duration: 0, // instant effect
    timeSkip: 30 * 60 // 30 minutes in seconds
  }
];

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const gameContext = useGame();
  const { state, addCoins } = gameContext;
  const { toast } = useToast();
  
  const [showAdNotification, setShowAdNotification] = useState(false);
  const [adBoostActive, setAdBoostActive] = useState(false);
  const [adBoostTimeRemaining, setAdBoostTimeRemaining] = useState(0);
  const [lastAdWatchedTime, setLastAdWatchedTime] = useState(0);
  const [nextAdTime, setNextAdTime] = useState(0);
  const [adNotificationStartTime, setAdNotificationStartTime] = useState(0);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [activeBoostType, setActiveBoostType] = useState<BoostType | null>(null);
  const [currentBoostConfig, setCurrentBoostConfig] = useState<BoostConfig | null>(null);
  const [availableBoost, setAvailableBoost] = useState<BoostConfig>(boostConfigs[0]);
  
  // Minimum time between ad offers (5 minutes)
  const minAdInterval = 5 * 60;
  // Maximum time between ad offers (15 minutes)
  const maxAdInterval = 15 * 60;
  // Cooldown period between ads (60 seconds)
  const cooldownPeriod = 60;
  // Auto-dismiss duration for ad notification (60 seconds)
  const adNotificationDuration = 60;
  
  // Proper function to get initial ad delay
  const getInitialAdDelay = () => Math.floor(Math.random() * (300 - 90 + 1)) + 90;
  
  // Function to select a random boost
  const selectRandomBoost = () => {
    const randomIndex = Math.floor(Math.random() * boostConfigs.length);
    setAvailableBoost(boostConfigs[randomIndex]);
    console.log(`Selected random boost: ${boostConfigs[randomIndex].type}`);
  };
  
  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        
        // Set the first ad to appear randomly between 90-300 seconds
        const initialDelay = getInitialAdDelay();
        console.log(`First ad will appear in ${initialDelay} seconds`);
        setNextAdTime(Date.now() + initialDelay * 1000); 
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };
    
    initAds();
  }, []);

  // Fix: Make sure nextAdTime has an initial value
  useEffect(() => {
    if (!nextAdTime) {
      const initialDelay = getInitialAdDelay();
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, [nextAdTime]);
  
  useInterval(() => {
    const now = Date.now();
    
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000 && !adBoostActive) {
      // Select a random boost when showing a new notification
      selectRandomBoost();
      
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      console.log('Showing ad notification with boost:', availableBoost.type);
      
      if (!isAdLoaded) {
        adMobService.loadInterstitialAd()
          .then(success => setIsAdLoaded(success))
          .catch(err => console.error('Failed to load ad', err));
      }
    }
    
    if (showAdNotification && now - adNotificationStartTime >= adNotificationDuration * 1000) {
      dismissAdNotification();
      console.log('Auto-dismissing ad notification');
    }
    
    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      
      if (adBoostTimeRemaining === 1) {
        // Deactivate the boost when time runs out
        setAdBoostActive(false);
        
        // Handle specific cleanup based on boost type
        if (activeBoostType === 'income') {
          gameContext.setIncomeMultiplier(1.0);
        } else if (activeBoostType === 'autoTap') {
          gameContext.setAutoTap(false);
        }
        
        setActiveBoostType(null);
        setCurrentBoostConfig(null);
      }
    }
  }, 1000);
  
  // Apply the time warp effect
  const applyTimeWarp = (seconds: number) => {
    const coinsPerSecond = state.coinsPerSecond;
    const reward = coinsPerSecond * seconds;
    
    // Add the coins
    addCoins(reward);
    
    // Trigger a toast notification
    toast({
      title: "Time Warp!",
      description: `Skipped ${seconds / 60} minutes and earned ${Math.floor(reward)} coins`,
      variant: "default",
    });
    
    // Apply white flash animation (handled in AdNotification component)
    document.dispatchEvent(new CustomEvent('timeWarpActivated'));
  };
  
  const handleWatchAd = async () => {
    if (adBoostActive) {
      setShowAdNotification(false);
      return;
    }
    
    // Store the selected boost before closing the notification
    const selectedBoost = availableBoost;
    setShowAdNotification(false);
    
    try {
      if (!isAdLoaded) {
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        if (!adLoaded) {
          throw new Error("Failed to load ad");
        }
      }
      
      const adCompleted = await adMobService.showInterstitialAd();
      setIsAdLoaded(false);
      
      // When ad completes successfully, apply the boost effect
      if (adCompleted) {
        setCurrentBoostConfig(selectedBoost);
        setActiveBoostType(selectedBoost.type);
        
        // Apply the appropriate boost effect
        if (selectedBoost.type === 'income') {
          setAdBoostActive(true);
          setAdBoostTimeRemaining(selectedBoost.duration);
          gameContext.setIncomeMultiplier(selectedBoost.multiplier || 2);
        } 
        else if (selectedBoost.type === 'autoTap') {
          setAdBoostActive(true);
          setAdBoostTimeRemaining(selectedBoost.duration);
          gameContext.setAutoTap(true);
        } 
        else if (selectedBoost.type === 'timeWarp') {
          // Time warp is an instant effect
          applyTimeWarp(selectedBoost.timeSkip || 1800);
        }
      }
      
      // Preload next ad
      adMobService.loadInterstitialAd()
        .then(success => setIsAdLoaded(success))
        .catch(err => console.error('Failed to load next ad', err));
      
      setLastAdWatchedTime(Date.now());
      
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
    } catch (error) {
      console.error("Error showing ad:", error);
      
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
      adBoostMultiplier: availableBoost.multiplier || 2,
      activeBoostType,
      currentBoostConfig,
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
