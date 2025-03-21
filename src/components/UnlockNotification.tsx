import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface UnlockNotificationProps {
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
  onClose: () => void;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ type, id, onClose }) => {
  const { state } = useGame();

  // Find the unlocked item
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
    if (type === 'manager') return (unlockedItem as typeof managers[0])?.avatar || '/default-avatar.png';
    if (type === 'artifact') return (unlockedItem as typeof artifacts[0])?.avatar || '/default-avatar.png';
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return achievement?.rewards?.image || (achievement?.rewards?.type === 'gems' ? '/gem-icon.png' : '/default-reward.png');
    }
    return '/default-avatar.png';
  };

  const getContent = () => {
    if (type === 'manager') {
      const manager = unlockedItem as typeof managers[0];
      return { title: manager?.name || 'Unknown Manager', detail: manager?.bonus || 'No bonus' };
    }
    if (type === 'artifact') {
      const artifact = unlockedItem as typeof artifacts[0];
      return { title: artifact?.name || 'Unknown Artifact', detail: artifact?.bonus || 'No bonus' };
    }
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return {
        title: achievement?.name || 'Unknown Achievement',
        detail: achievement?.description || 'No requirement',
      };
    }
    return { title: 'Unknown', detail: 'No detail' };
  };

  const image = getImage();
  const { title, detail } = getContent();

  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!unlockedItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-900 border border-yellow-400 rounded-lg p-4 max-w-sm w-full text-center shadow-lg"
      >
        {/* Image with Scale, Glow, and Sparkles */}
        <div className="relative mx-auto w-20 h-20">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full rounded-full border-2 border-yellow-400 object-cover"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full animate-glow" style={{ boxShadow: '0 0 15px 5px rgba(255, 215, 0, 0.7)' }} />
          {/* Sparkles */}
          <div className="absolute inset-0 animate-sparkle bg-[url('/sparkle.png')] bg-no-repeat bg-center" />
        </div>

        {/* Title and Detail */}
        <h3 className="mt-4 text-yellow-300 font-bold text-lg">{title}</h3>
        <p className="text-blue-200 text-sm">
          {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
        </p>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Back
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
          }
          .animate-glow {
            animation: glow 1.5s infinite;
          }
          @keyframes sparkle {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.5); }
          }
          .animate-sparkle {
            animation: sparkle 1s infinite;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

// Wrapper component
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<
    { type: 'manager' | 'artifact' | 'achievement'; id: string }[]
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
      setNotifications((prev) => [...prev, { type: 'manager', id: newManagers[0] }]);
      console.log('New Manager:', newManagers[0]);
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotifications((prev) => [...prev, { type: 'artifact', id: newArtifacts[0] }]);
      console.log('New Artifact:', newArtifacts[0]);
    }

    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotifications((prev) => [...prev, { type: 'achievement', id: newAchievements[0].id }]);
      console.log('New Achievement:', newAchievements[0].id);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {notifications.map((n, index) => (
        <UnlockNotification
          key={`${n.type}-${n.id}-${index}`}
          type={n.type}
          id={n.id}
          onClose={() => handleClose(index)}
        />
      ))}
    </>
  );
};

export default UnlockNotificationWrapper;
