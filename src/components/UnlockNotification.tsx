import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

// Props for the notification
interface UnlockNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ isOpen, onClose, type, id }) => {
  const { state } = useGame();
  const [hasInteracted, setHasInteracted] = useState(false);

  // Find the unlocked item based on type and ID
  const getUnlockedItem = () => {
    switch (type) {
      case 'manager':
        return managers.find((m) => m.id === id);
      case 'artifact':
        return artifacts.find((a) => a.id === id);
      case 'achievement':
        return state.achievements.find((a) => a.id === id);
      default:
        return null;
    }
  };

  const unlockedItem = getUnlockedItem();

  // Determine image and content
  const getImage = () => {
    if (type === 'manager') return (unlockedItem as typeof managers[0])?.avatar;
    if (type === 'artifact') return (unlockedItem as typeof artifacts[0])?.avatar;
    if (type === 'achievement') return (unlockedItem as Achievement)?.rewards?.image;
    return '';
  };

  const getContent = () => {
    if (type === 'manager') {
      const manager = unlockedItem as typeof managers[0];
      return {
        title: manager?.name || 'Unknown Manager',
        detail: manager?.bonus || 'No bonus specified',
      };
    }
    if (type === 'artifact') {
      const artifact = unlockedItem as typeof artifacts[0];
      return {
        title: artifact?.name || 'Unknown Artifact',
        detail: artifact?.bonus || 'No bonus specified',
      };
    }
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return {
        title: achievement?.name || 'Unknown Achievement',
        detail: achievement?.description || 'No requirement specified',
        reward: achievement?.rewards
          ? `${achievement.rewards.type === 'gems' ? `${achievement.rewards.value} Gems` : achievement.rewards.value}`
          : 'No reward',
      };
    }
    return { title: '', detail: '', reward: '' };
  };

  const image = getImage();
  const { title, detail, reward } = getContent();

  // Auto-close after 3 seconds if no interaction
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasInteracted, onClose]);

  // Handle interaction to prevent auto-close
  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  };

  if (!unlockedItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg p-2 max-w-[90vw] md:max-w-md"
          onClick={handleInteraction}
        >
          {/* Left Side: Title and Detail */}
          <div className="flex-1 pr-2">
            <p className="text-yellow-300 font-semibold text-xs md:text-sm">{title}</p>
            <p className="text-blue-200 text-[10px] md:text-xs">
              {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
            </p>
          </div>

          {/* Right Side: Reward or Image */}
          <div className="flex-shrink-0">
            {type === 'achievement' ? (
              <p className="text-yellow-300 font-medium text-xs md:text-sm text-right">
                Reward: {reward}
              </p>
            ) : (
              <img
                src={image}
                alt={title}
                className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-full border border-yellow-400/30"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// White Flash Animation Component
const FlashAnimation: React.FC<{ trigger: boolean; onComplete: () => void }> = ({ trigger, onComplete }) => {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white z-[9999]"
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  );
};

// Wrapper component to track unlocks and manage state, including time_warp flash
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'manager' | 'artifact' | 'achievement';
    id: string;
  } | null>(null);
  const [prevState, setPrevState] = useState<GameState | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!prevState) {
      setPrevState(state);
      return;
    }

    // Check for new managers
    const newManagers = state.ownedManagers.filter(
      (m) => !prevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      setNotification({ isOpen: true, type: 'manager', id: newManagers[0] });
    }

    // Check for new artifacts
    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotification({ isOpen: true, type: 'artifact', id: newArtifacts[0] });
    }

    // Check for new achievements
    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotification({ isOpen: true, type: 'achievement', id: newAchievements[0].id });
    }

    // Check for time_warp usage
    const prevTimeWarpBoosts = prevState.activeBoosts.filter(b => b.id === 'boost-time-warp');
    const currentTimeWarpBoosts = state.activeBoosts.filter(b => b.id === 'boost-time-warp');
    if (currentTimeWarpBoosts.length > prevTimeWarpBoosts.length) {
      setShowFlash(true);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = () => {
    setNotification((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  const handleFlashComplete = () => {
    setShowFlash(false);
  };

  return (
    <>
      <UnlockNotification
        isOpen={notification?.isOpen || false}
        onClose={handleClose}
        type={notification?.type || 'achievement'}
        id={notification?.id || ''}
      />
      <FlashAnimation trigger={showFlash} onComplete={handleFlashComplete} />
    </>
  );
};

export default UnlockNotificationWrapper;
