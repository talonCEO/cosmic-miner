import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';

// Props for individual notification
interface UnlockNotificationProps {
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
  onClose: () => void;
}

// Single Notification Component
const UnlockNotification: React.FC<UnlockNotificationProps> = ({ type, id, onClose }) => {
  const { state } = useGame();
  const [isVisible, setIsVisible] = useState(true);

  // Find the unlocked item
  const getUnlockedItem = () => {
    console.log('Searching for:', { type, id });
    switch (type) {
      case 'manager':
        return managers.find((m) => m.id === id);
      case 'artifact':
        return artifacts.find((a) => a.id === id);
      case 'achievement':
        return (state.achievements || []).find((a) => a.id === id);
      default:
        return null;
    }
  };

  const unlockedItem = getUnlockedItem();
  console.log('Found item:', unlockedItem);

  // Get image and content
  const getImage = () => {
    if (!unlockedItem) return '/default-avatar.png';
    if (type === 'manager') return unlockedItem.avatar || '/default-avatar.png';
    if (type === 'artifact') return unlockedItem.avatar || '/default-avatar.png';
    if (type === 'achievement') {
      return unlockedItem.rewards?.image || (unlockedItem.rewards?.type === 'gems' ? '/gem-icon.png' : '/default-reward.png');
    }
    return '/default-avatar.png';
  };

  const getContent = () => {
    if (!unlockedItem) return { title: 'Unknown', detail: 'No detail' };
    if (type === 'manager') {
      return { title: unlockedItem.name || 'Unknown Manager', detail: unlockedItem.bonus || 'No bonus' };
    }
    if (type === 'artifact') {
      return { title: unlockedItem.name || 'Unknown Artifact', detail: unlockedItem.bonus || 'No bonus' };
    }
    if (type === 'achievement') {
      return {
        title: unlockedItem.name || 'Unknown Achievement',
        detail: unlockedItem.description || 'No requirement',
      };
    }
    return { title: 'Unknown', detail: 'No detail' };
  };

  const image = getImage();
  const { title, detail } = getContent();

  // Auto-close after 3 seconds
  useEffect(() => {
    console.log('Starting 3s timer');
    const timer = setTimeout(() => {
      console.log('Timer expired, fading out');
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, 3000);
    return () => {
      console.log('Cleaning up timer');
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleClose = () => {
    console.log('Manual close triggered');
    setIsVisible(false);
    setTimeout(onClose, 300); // Match fade-out duration
  };

  if (!unlockedItem) {
    console.log('No item, skipping render');
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-900 border border-yellow-400 rounded-lg p-4 max-w-sm w-full text-center shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Image with scale, glow, and sparkles */}
      <div className="relative mx-auto w-20 h-20">
        <img
          src={image}
          alt={title}
          className="w-full h-full rounded-full border-2 border-yellow-400 object-cover animate-scale-up"
        />
        <div className="absolute inset-0 rounded-full animate-glow" style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)' }} />
        <div className="absolute inset-0 animate-sparkle" style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)' }} />
      </div>

      {/* Text */}
      <h3 className="mt-4 text-yellow-300 font-bold text-lg">{title}</h3>
      <p className="text-blue-200 text-sm">
        {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
      </p>

      {/* Back Button */}
      <button
        onClick={handleClose}
        className="mt-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
      >
        Back
      </button>

      {/* X Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scale-up {
          0% { transform: scale(0.8); }
          100% { transform: scale(1.2); }
        }
        .animate-scale-up {
          animation: scale-up 0.5s ease-out forwards;
        }
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
    </div>
  );
};

// Wrapper Component
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<
    { type: 'manager' | 'artifact' | 'achievement'; id: string }[]
  >([]);
  const [prevState, setPrevState] = useState<GameState | null>(null);

  useEffect(() => {
    console.log('Checking state:', state);
    if (!prevState) {
      console.log('Setting initial prevState');
      setPrevState(state);
      return;
    }

    const safeState = {
      ownedManagers: state.ownedManagers || [],
      ownedArtifacts: state.ownedArtifacts || [],
      achievements: state.achievements || [],
    };
    const safePrevState = {
      ownedManagers: prevState.ownedManagers || [],
      ownedArtifacts: prevState.ownedArtifacts || [],
      achievements: prevState.achievements || [],
    };

    const newManagers = safeState.ownedManagers.filter(
      (m) => !safePrevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      console.log('New manager detected:', newManagers[0]);
      setNotifications((prev) => [...prev, { type: 'manager', id: newManagers[0] }]);
    }

    const newArtifacts = safeState.ownedArtifacts.filter(
      (a) => !safePrevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      console.log('New artifact detected:', newArtifacts[0]);
      setNotifications((prev) => [...prev, { type: 'artifact', id: newArtifacts[0] }]);
    }

    const newAchievements = safeState.achievements.filter(
      (a) => a.unlocked && !safePrevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      console.log('New achievement detected:', newAchievements[0].id);
      setNotifications((prev) => [...prev, { type: 'achievement', id: newAchievements[0].id }]);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = (index: number) => {
    console.log('Removing notification at index:', index);
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {notifications.map((n, index) => (
        <UnlockNotification
          key={`${n.type}-${n.id}-${index}`}
          type={n.type}
          id={n.id}
          onClose={() => handleClose(index)}
        />
      ))}
    </div>
  );
};

export default UnlockNotificationWrapper;
