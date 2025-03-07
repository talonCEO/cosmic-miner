
// Simplified mock AdMobService that doesn't try to use real AdMob
class AdMobService {
  private initialized = false;

  // Initialize AdMob (mock)
  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        console.log('Mock AdMob initialized successfully');
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize mock AdMob:', error);
      }
    }
  }

  // Load an interstitial ad (mock)
  async loadInterstitialAd(): Promise<boolean> {
    try {
      if (!this.initialized) await this.initialize();
      
      console.log('Mock interstitial ad loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load mock interstitial ad:', error);
      return false;
    }
  }

  // Show the loaded interstitial ad (mock)
  async showInterstitialAd(): Promise<boolean> {
    try {
      console.log('Mock interstitial ad shown successfully');
      return true;
    } catch (error) {
      console.error('Failed to show mock interstitial ad:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
