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
      return `You’ve hired ${(unlockedItem as typeof managers[0])?.name}! Their expertise will boost your operations.`;
    if (type === 'artifact')
      return `You’ve discovered ${(unlockedItem as typeof artifacts[0])?.name}! Its powers are now yours.`;
    if (type === 'achievement')
      return `You’ve unlocked the "${(unlockedItem as Achievement)?.name}" achievement for ${(
        unlockedItem as Achievement
      )?.description.toLowerCase()}!`;
    return '';
  };

  const image = getImage();
  const description = getDescription();

  if (!unlockedItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl p-6 w-11/12 max-w-md border border-indigo-500/50 shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-slate-300 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>

            {/* Congratulations Text */}
            <h2 className="text-3xl font-bold text-center text-yellow-400 mb-4">Congratulations!</h2>

            {/* Image with Visual Effects */}
            <div className="flex justify-center mb-4">
              <motion.div
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/50"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(255, 191, 0, 0.5)',
                    '0 0 20px rgba(255, 191, 0, 0.8)',
                    '0 0 10px rgba(255, 191, 0, 0.5)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src={image}
                  alt={unlockedItem.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-500/20 pointer-events-none" />
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-center text-slate-200 text-sm mb-6">{description}</p>

            {/* Back Button */}
            <div className="flex justify-center">
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors"
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
