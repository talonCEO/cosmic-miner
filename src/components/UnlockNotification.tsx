import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

interface UnlockNotificationProps {
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
  onClose: () => void;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ type, id, onClose }) => {
  const { state } = useGame();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Find the unlocked item
  const getUnlockedItem = () => {
    switch (type) {
      case 'manager':
        return managers.find((m) => m.id === id);
      case 'artifact':
        return artifacts.find((a) => a.id === id); // Fixed typo: 'm.id' -> 'a.id'
      case 'achievement':
        return state.achievements.find((a) => a.id === id);
      default:
        return null;
    }
  };

  const unlockedItem = getUnlockedItem();

  // Log for debugging
  useEffect(() => {
    console.log('UnlockNotification triggered:', { type, id, unlockedItem });
  }, [type, id, unlockedItem]);

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
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    if (notificationRef.current) {
      gsap.fromTo(
        notificationRef.current,
        { y: 100, scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  // Handle close with GSAP exit
  const handleClose = () => {
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        opacity: 0,
        y: 50,
        rotate: 5,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!unlockedItem) {
    console.log('No unlocked item found for:', { type, id });
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center z-[100]"
      onClick={handleClose}
    >
      <motion.div
        ref={notificationRef}
        className="relative bg-indigo-900 border border-yellow-400 rounded-lg p-3 mb-4 w-full max-w-md shadow-lg flex items-center"
        style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)' }}
        onClick={(e) => e.stopPropagation()}
        animate={{ scale: [1, 1.02, 1], transition: { duration: 1, repeat: Infinity } }}
      >
        {/* Left: Title and Detail */}
        <div className="flex-1 pr-3">
          <h3 className="text-yellow-300 font-bold text-sm md:text-base">{title}</h3>
          <p className="text-blue-200 text-xs md:text-sm">
            {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
          </p>
        </div>

        {/* Right: Image */}
        <div className="flex-shrink-0">
          <motion.img
            src={image}
            alt={title}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-yellow-400 object-cover"
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ duration: 0.5, yoyo: Infinity }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 text-yellow-300 hover:text-yellow-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
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
      console.log('New Manager Unlocked:', newManagers[0]);
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotifications((prev) => [...prev, { type: 'artifact', id: newArtifacts[0] }]);
      console.log('New Artifact Unlocked:', newArtifacts[0]);
    }

    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotifications((prev) => [...prev, { type: 'achievement', id: newAchievements[0].id }]);
      console.log('New Achievement Unlocked:', newAchievements[0].id);
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
