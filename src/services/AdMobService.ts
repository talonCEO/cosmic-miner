import { AdMob, AdOptions, InterstitialAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

// Initialize AdMob once when the service is first imported
let initialized = false;

// Type definition for a listener function
type ListenerFunction = (...args: any[]) => void;

// Type to track listeners with their event name and function reference
interface TrackedListener {
  eventName: string;
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
  private addTrackedListener(eventName: string, listenerFn: ListenerFunction): void {
    // Add to the AdMob plugin
    AdMob.addListener(eventName, listenerFn);
    
    // Track it in our array
    this.listeners.push({
      eventName,
      listenerFn
    });
    
    console.log(`Added listener for event: ${eventName}`);
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
    this.addTrackedListener(InterstitialAdPluginEvents.Loaded, loadedFn);

    const failedFn = (error: any) => {
      console.error('Interstitial ad failed to load:', error);
      onAdFailed?.();
    };
    this.addTrackedListener(InterstitialAdPluginEvents.FailedToLoad, failedFn);

    const dismissedFn = () => {
      console.log('Interstitial ad dismissed');
      onAdDismissed?.();
    };
    this.addTrackedListener(InterstitialAdPluginEvents.Dismissed, dismissedFn);
  }

  // Remove all tracked event listeners 
  async removeAllListeners(): Promise<void> {
    try {
      if (this.listeners.length === 0) {
        console.log('No ad listeners to remove');
        return;
      }
      
      // Remove each listener that we've tracked
      for (const listener of this.listeners) {
        try {
          AdMob.removeListener(listener.eventName, listener.listenerFn);
          console.log(`Removed listener for event: ${listener.eventName}`);
        } catch (err) {
          console.error(`Error removing listener for ${listener.eventName}:`, err);
        }
      }
      
      // Clear the array
      this.listeners = [];
      console.log('All ad listeners removed');
    } catch (error) {
      console.error('Error removing ad listeners:', error);
    }
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
