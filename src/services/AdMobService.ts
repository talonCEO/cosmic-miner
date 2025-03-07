
import { AdMob, AdOptions, InterstitialAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

// Initialize AdMob once when the service is first imported
let initialized = false;

// Type definition for listeners
type ListenerFunction = (...args: any[]) => void;

// Interface to track listeners with their event name and function reference
interface TrackedListener {
  eventName: keyof typeof InterstitialAdPluginEvents;
  listenerFn: ListenerFunction;
}

class AdMobService {
  // Test ad IDs - replace with your real IDs in production
  private interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // Test ID
  
  // Array to keep track of all event listeners
  private listeners: TrackedListener[] = [];

  constructor() {
    this.initialize();
  }

  // Initialize AdMob
  async initialize(): Promise<void> {
    if (!initialized) {
      try {
        await AdMob.initialize();
        console.log('AdMob initialized successfully');
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    }
  }

  // Load an interstitial ad
  async loadInterstitialAd(): Promise<boolean> {
    try {
      if (!initialized) await this.initialize();
      
      const options: AdOptions = {
        adId: this.interstitialAdId,
      };
      
      await AdMob.prepareInterstitial(options);
      console.log('Interstitial ad loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
      return false;
    }
  }

  // Show the loaded interstitial ad
  async showInterstitialAd(): Promise<boolean> {
    try {
      const result = await AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }

  // Helper method to add a listener and track it
  private addTrackedListener(eventName: keyof typeof InterstitialAdPluginEvents, listenerFn: ListenerFunction): void {
    // Get the actual event value from the enum
    const eventValue = InterstitialAdPluginEvents[eventName];
    
    // Add to the AdMob plugin
    AdMob.addListener(eventValue, listenerFn);
    
    // Track it in our array
    this.listeners.push({
      eventName,
      listenerFn
    });
    
    console.log(`Added listener for event: ${eventValue}`);
  }

  // Set up event listeners for ads
  setupAdEventListeners(
    onAdLoaded?: () => void,
    onAdFailed?: () => void,
    onAdDismissed?: () => void
  ): void {
    // Listen for interstitial ad events
    const loadedFn = () => {
      console.log('Interstitial ad loaded');
      onAdLoaded?.();
    };
    this.addTrackedListener('Loaded', loadedFn);

    const failedFn = (error: any) => {
      console.error('Interstitial ad failed to load:', error);
      onAdFailed?.();
    };
    this.addTrackedListener('FailedToLoad', failedFn);

    const dismissedFn = () => {
      console.log('Interstitial ad dismissed');
      onAdDismissed?.();
    };
    this.addTrackedListener('Dismissed', dismissedFn);
  }

  // Remove all tracked event listeners 
  async removeAllListeners(): Promise<void> {
    try {
      if (this.listeners.length === 0) {
        console.log('No ad listeners to remove');
        return;
      }
      
      // Log how many listeners we're cleaning up
      console.log(`Cleaning up ${this.listeners.length} ad listeners`);
      
      // Attempt to remove each listener
      for (const listener of this.listeners) {
        const eventValue = InterstitialAdPluginEvents[listener.eventName];
        try {
          // Use the removeAllListeners method since removeListener isn't directly available
          await AdMob.removeAllListeners();
        } catch (err) {
          console.warn(`Could not remove listener for ${eventValue}:`, err);
        }
      }
      
      // Clear our internal tracking array
      this.listeners = [];
      
      console.log('All ad listeners marked for cleanup');
    } catch (error) {
      console.error('Error removing ad listeners:', error);
    }
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
