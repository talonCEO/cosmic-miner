
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourusername.cosmic.miner', // REPLACE with your unique app ID
  appName: 'Cosmic Miner', // You can keep or change this game name
  webDir: 'dist',
  server: {
    // For development only - remove for production build
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    // Add AdMob configuration
    AdMob: {
      // Replace with your actual AdMob app ID
      androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', 
    },
    // Add Google Play Billing configuration with your product IDs
    GooglePlayBilling: {
      enabled: true,
      inAppProducts: [
        'gem_package_small',
        'gem_package_medium',
        'gem_package_large',
        'gem_package_xl',
        'gem_package_xxl',
        'gem_package_mega'
      ],
      subscriptionProducts: []
    }
  }
};

export default config;
