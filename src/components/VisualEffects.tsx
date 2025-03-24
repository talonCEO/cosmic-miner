import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import styles from './VisualEffects.module.css'; // Import CSS module

const VisualEffects: React.FC = () => {
  const { state } = useGame();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const timeWarpBoost = state.activeBoosts.find(boost => boost.id === 'boost-time-warp');
    if (timeWarpBoost && timeWarpBoost.activatedAt) {
      const now = Math.floor(Date.now() / 1000);
      const recentlyActivated = now - timeWarpBoost.activatedAt < 1; // Trigger within 1 second
      if (recentlyActivated && !showFlash) {
        setShowFlash(true);
        const timer = setTimeout(() => setShowFlash(false), 500); // Flash lasts 500ms
        return () => clearTimeout(timer);
      }
    }
  }, [state.activeBoosts, showFlash]);

  return showFlash ? <div className={styles.flash} /> : null;
};

export default VisualEffects;
