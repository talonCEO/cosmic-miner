
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
    }
  }
};

export default config;
