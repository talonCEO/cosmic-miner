import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
  const [interacted, setInteracted] = useState(false); // Track user interaction

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

  // Determine image and description
  const getImage = () => {
    if (type === 'manager') return (unlockedItem as typeof managers[0])?.avatar;
    if (type === 'artifact') return (unlockedItem as typeof artifacts[0])?.avatar;
    if (type === 'achievement') return (unlockedItem as Achievement)?.rewards?.image;
    return '';
  };

  const getDescription = () => {
    if (type === 'manager')
      return `You’ve hired ${(unlockedItem as typeof managers[0])?.name}!`;
    if (type === 'artifact')
      return `You’ve discovered ${(unlockedItem as typeof artifacts[0])?.name}!`;
    if (type === 'achievement')
      return `Achievement: ${(unlockedItem as Achievement)?.name}!`;
    return '';
  };

  const image = getImage();
  const description = getDescription();

  // Auto-close after 3 seconds if no interaction
  useEffect(() => {
    if (isOpen && !interacted) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, interacted, onClose]);

  // Handle interaction (prevents auto-close)
  const handleInteraction = () => {
    setInteracted(true);
  };

  // Close when clicking outside
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!unlockedItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40" // Lighter background
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackgroundClick} // Close on background click
        >
          <motion.div
            className="relative bg-gradient-to-br from-indigo-800 to-slate-700 rounded-lg p-5 w-10/12 max-w-sm border border-indigo-400/30 shadow-md" // Softer colors, smaller size
            initial={{ scale: 0.9, opacity: 0 }} // More subtle scale
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }} // Gentler spring
            onClick={handleInteraction} // Mark as interacted on click
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={20} /> {/* Slightly smaller */}
            </button>

            {/* Congratulations Text */}
            <h2 className="text-2xl font-semibold text-center text-yellow-300 mb-3">Congratulations!</h2> {/* Softer yellow, smaller text */}

            {/* Image with Visual Effects */}
            <div className="flex justify-center mb-3">
              <motion.div
                className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/40" // Smaller image, subtler border
                animate={{
                  boxShadow: [
                    '0 0 8px rgba(255, 191, 0, 0.4)',
                    '0 0 12px rgba(255, 191, 0, 0.6)',
                    '0 0 8px rgba(255, 191, 0, 0.4)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src={image}
                  alt={unlockedItem.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/10 pointer-events-none" /> {/* Subtler gradient */}
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-center text-slate-300 text-xs mb-4">{description}</p> {/* Smaller text, lighter color */}

            {/* Back Button */}
            <div className="flex justify-center">
              <Button
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-1 rounded-md transition-colors text-sm" // Smaller button
                onClick={onClose}
              >
                Back
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Wrapper component to track unlocks and manage state
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'manager' | 'artifact' | 'achievement';
    id: string;
  } | null>(null);

  // Track previous state to detect unlocks
  const [prevState, setPrevState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!prevState) {
      setPrevState(state);
      return;
    }

    // Check for newly unlocked managers
    const newManagers = state.ownedManagers.filter(
      (m) => !prevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      setNotification({ isOpen: true, type: 'manager', id: newManagers[0] });
    }

    // Check for newly unlocked artifacts
    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotification({ isOpen: true, type: 'artifact', id: newArtifacts[0] });
    }

    // Check for newly unlocked achievements
    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotification({ isOpen: true, type: 'achievement', id: newAchievements[0].id });
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = () => {
    setNotification((prev) => (prev ? { ...prev, isOpen: false } : null));
  };

  return (
    <UnlockNotification
      isOpen={notification?.isOpen || false}
      onClose={handleClose}
      type={notification?.type || 'achievement'}
      id={notification?.id || ''}
    />
  );
};

export default UnlockNotificationWrapper;
