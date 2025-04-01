import React, { useCallback, useState, useEffect } from 'react';
import { Gem, Sparkles, PackagePlus } from 'lucide-react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { InventoryItem } from '@/components/menu/types';
import './LevelUpPopup.css';

interface LevelUpPopupProps {
  level: number;
  rewards: {
    gems: number;
    essence: number;
    inventoryItems: InventoryItem[];
  };
  onClose: () => void;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ level, rewards, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      const fadeTimer = setTimeout(() => onClose(), 500); // Call onClose after fade-out
      return () => clearTimeout(fadeTimer);
    }
  }, [isVisible, onClose]);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className={`level-up-overlay ${isVisible ? 'fade-in' : 'fade-out'}`}
      onClick={handleOverlayClick}
    >
      <Particles
        init={particlesInit}
        options={{
          particles: {
            number: { value: 50 },
            color: { value: '#ffd700' },
            size: { value: 3, random: true, anim: { enable: true, speed: 2 } },
            move: { enable: true, speed: 1, direction: 'none', random: true },
            opacity: { value: 0.8, random: true },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
        }}
      />
      <div className="level-up-popup">
        <h1 className="level-up-title">Level Up!</h1>
        <p className="level-up-subtitle">You reached Level {level}</p>
        <div className="rewards-row">
          <div className="reward-item">
            <Gem size={32} className="text-purple-400 reward-icon" />
            <span>+{rewards.gems} Gems</span>
          </div>
          <div className="reward-item">
            <Sparkles size={32} className="text-teal-400 reward-icon" />
            <span>+{rewards.essence} Essence</span>
          </div>
          {rewards.inventoryItems.map((item, index) => (
            <div key={index} className="reward-item">
              {item.icon}
              <span>{item.name} x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;