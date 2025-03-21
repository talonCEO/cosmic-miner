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
  const [hasInteracted, setHasInteracted] = useState(false); // Track interaction

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

  const getContent = () => {
    if (type === 'manager') {
      const manager = unlockedItem as typeof managers[0];
      return {
        title: manager?.name,
        detail: manager?.bonus || 'No bonus specified',
      };
    }
    if (type === 'artifact') {
      const artifact = unlockedItem as typeof artifacts[0];
      return {
        title: artifact?.name,
        detail: artifact?.bonus || 'No bonus specified',
      };
    }
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return {
        title: achievement?.name,
        detail: achievement?.description || 'No requirement specified',
      };
    }
    return { title: '', detail: '' };
  };

  const image = getImage();
  const { title, detail } = getContent();

  // Auto-close after 3 seconds if no interaction
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer); // Cleanup on unmount or interaction
    }
  }, [isOpen, hasInteracted, onClose]);

  // Handle interaction to prevent auto-close
  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to background
    setHasInteracted(true);
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
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20" // Even less visible background
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackgroundClick} // Close on background click
        >
          <motion.div
            className="relative bg-gradient-to-br from-indigo-800 to-slate-700 rounded-lg p-4 w-11/12 max-w-xs border border-indigo-400/20 shadow-sm" // Smaller size
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={handleInteraction} // Mark as interacted
          >
            {/* Close Button */}
            <button
              className="absolute top-1 right-1 text-slate-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={16} /> {/* Smaller X */}
            </button>

            {/* Congratulations Text */}
            <h2 className="text-xl font-semibold text-center text-yellow-300 mb-2">Congratulations!</h2> {/* Smaller text */}

            {/* Image with Visual Effects */}
            <div className="flex justify-center mb-2">
              <motion.div
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/30" // Smaller image
                animate={{
                  boxShadow: [
                    '0 0 6px rgba(255, 191, 0, 0.3)',
                    '0 0 10px rgba(255, 191, 0, 0.5)',
                    '0 0 6px rgba(255, 191, 0, 0.3)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/10 pointer-events-none" />
              </motion.div>
            </div>

            {/* Title and Detail */}
            <p className="text-center text-slate-200 text-sm font-medium">{title}</p>
            <p className="text-center text-slate-300 text-xs mt-1 mb-3">{detail}</p> {/* Smaller detail text */}

            {/* Back Button */}
            <div className="flex justify-center">
              <Button
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-md transition-colors text-xs" // Smaller button
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
