import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';

const VisualEffects: React.FC = () => {
  const { state } = useGame();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // Detect when a time warp boost is activated
    const timeWarpBoost = state.activeBoosts.find(boost => boost.id === 'boost-time-warp');
    if (timeWarpBoost && timeWarpBoost.activatedAt) {
      const now = Math.floor(Date.now() / 1000);
      const recentlyActivated = now - timeWarpBoost.activatedAt < 1; // Within 1 second

      if (recentlyActivated && !showFlash) {
        setShowFlash(true);

        // Flash duration: 500ms
        const timer = setTimeout(() => {
          setShowFlash(false);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [state.activeBoosts]);

  return (
    <>
      {showFlash && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            animation: 'flash 0.5s ease-in-out',
          }}
        />
      )}
      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default VisualEffects;