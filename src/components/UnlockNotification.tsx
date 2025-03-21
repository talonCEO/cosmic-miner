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
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasInteracted, onClose]);

  // Handle interaction to prevent auto-close
  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
  };

  if (!unlockedItem) return null;

  // Image animation: Bounce up and dazzle
  const imageVariants = {
    initial: { y: '100vh', opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 10,
        duration: 0.5,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  // Particle-like dazzle effect
  const dazzleVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: 2,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50" // No background
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleInteraction}
        >
          <div className="relative text-center">
            {/* Congratulations Text */}
            <motion.h2
              className="text-xl font-semibold text-yellow-300 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Congratulations!
            </motion.h2>

            {/* Image with Bounce and Dazzle */}
            <motion.div
              className="relative w-20 h-20 rounded-full overflow-hidden"
              variants={imageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <img
                src={image}
                alt={title}
                className="w-full h-full object-contain"
              />
              {/* Dazzle Effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400/50"
                variants={dazzleVariants}
                animate="animate"
              />
            </motion.div>

            {/* Title and Detail */}
            <motion.p
              className="text-slate-200 text-sm font-medium mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {title}
            </motion.p>
            <motion.p
              className="text-slate-300 text-xs mt-1 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {detail}
            </motion.p>

            {/* Back Button */}
            {hasInteracted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-md transition-colors text-xs"
                  onClick={onClose}
                >
                  Back
                </Button>
              </motion.div>
            )}
          </div>
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
      setNotification({ isOpen: true, type: 'manager', id: newManagers[0] });
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotification({ isOpen: true, type: 'artifact', id: newArtifacts[0] });
    }

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
