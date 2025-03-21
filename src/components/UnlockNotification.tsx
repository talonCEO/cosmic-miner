import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return achievement?.rewards?.image || (achievement?.rewards?.type === 'gems' ? '/path/to/gem-icon.png' : '');
    }
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
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg p-2 max-w-[90vw] md:max-w-md relative"
          onClick={handleInteraction}
        >
          {/* Left Side: Title and Detail */}
          <div className="flex-1 pr-2">
            <p className="text-yellow-300 font-semibold text-xs md:text-sm">{title}</p>
            <p className="text-blue-200 text-[10px] md:text-xs">
              {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
            </p>
          </div>

          {/* Right Side: Reward Image or Manager/Artifact Image */}
          <div className="flex-shrink-0 flex items-center">
            {type === 'achievement' && image ? (
              <img
                src={image}
                alt={reward}
                className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-full border border-yellow-400/30"
              />
            ) : type !== 'achievement' ? (
              <img
                src={image}
                alt={title}
                className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-full border border-yellow-400/30"
              />
            ) : null}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-1 right-1 text-blue-300 hover:text-blue-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Wrapper component to track unlocks and manage state
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<
    { isOpen: boolean; type: 'manager' | 'artifact' | 'achievement'; id: string }[]
  >([]);

  const [prevState, setPrevState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!prevState) {
      setPrevState(state);
      return;
    }

    const newManagers = state.ownedManagers.filter(
      (m) => !prevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      setNotifications((prev) => [
        ...prev,
        { isOpen: true, type: 'manager', id: newManagers[0] },
      ]);
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotifications((prev) => [
        ...prev,
        { isOpen: true, type: 'artifact', id: newArtifacts[0] },
      ]);
    }

    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotifications((prev) => [
        ...prev,
        { isOpen: true, type: 'achievement', id: newAchievements[0].id },
      ]);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isOpen: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((_, i) => i !== index));
    }, 300); // Match transition duration
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <UnlockNotification
          key={`${notification.type}-${notification.id}-${index}`}
          isOpen={notification.isOpen}
          onClose={() => handleClose(index)}
          type={notification.type}
          id={notification.id}
        />
      ))}
    </>
  );
};

export default UnlockNotificationWrapper;
