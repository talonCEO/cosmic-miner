import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';

// Props
interface UnlockNotificationProps {
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
  onClose: () => void;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ type, id, onClose }) => {
  const { state } = useGame();

  // Find the unlocked item
  const getUnlockedItem = () => {
    console.log('Finding item:', { type, id });
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
  console.log('Unlocked item:', unlockedItem);

  // Image and content
  const getImage = () => {
    if (type === 'manager') return unlockedItem?.avatar || '/default-avatar.png';
    if (type === 'artifact') return unlockedItem?.avatar || '/default-avatar.png';
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return achievement?.rewards?.image || (achievement?.rewards?.type === 'gems' ? '/gem-icon.png' : '/default-reward.png');
    }
    return '/default-avatar.png';
  };

  const getContent = () => {
    if (type === 'manager') {
      return { title: unlockedItem?.name || 'Unknown Manager', detail: unlockedItem?.bonus || 'No bonus' };
    }
    if (type === 'artifact') {
      return { title: unlockedItem?.name || 'Unknown Artifact', detail: unlockedItem?.bonus || 'No bonus' };
    }
    if (type === 'achievement') {
      return {
        title: unlockedItem?.name || 'Unknown Achievement',
        detail: unlockedItem?.description || 'No requirement',
      };
    }
    return { title: 'Unknown', detail: 'No detail' };
  };

  const image = getImage();
  const { title, detail } = getContent();

  // Auto-close after 3 seconds
  useEffect(() => {
    console.log('Setting timeout for close');
    const timer = setTimeout(() => {
      console.log('Closing notification');
      onClose();
    }, 3000);
    return () => {
      console.log('Clearing timeout');
      clearTimeout(timer);
    };
  }, [onClose]);

  if (!unlockedItem) {
    console.log('No item found, returning null');
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-900 border border-yellow-400 rounded-lg p-4 max-w-sm w-full text-center shadow-lg animate-fade-in">
      {/* Image */}
      <div className="relative mx-auto w-20 h-20">
        <img
          src={image}
          alt={title}
          className="w-full h-full rounded-full border-2 border-yellow-400 object-cover animate-scale-up"
        />
        <div className="absolute inset-0 rounded-full animate-glow" style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)' }} />
      </div>

      {/* Text */}
      <h3 className="mt-4 text-yellow-300 font-bold text-lg">{title}</h3>
      <p className="text-blue-200 text-sm">
        {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
      </p>

      {/* Back Button */}
      <button
        onClick={onClose}
        className="mt-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        Back
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes scale-up {
          from { transform: scale(0.8); }
          to { transform: scale(1.2); }
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
      `}</style>
    </div>
  );
};

// Wrapper
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<
    { type: 'manager' | 'artifact' | 'achievement'; id: string }[]
  >([]);
  const [prevState, setPrevState] = useState<GameState | null>(null);

  useEffect(() => {
    console.log('State changed:', state);
    if (!prevState) {
      setPrevState(state);
      return;
    }

    const newManagers = state.ownedManagers.filter(
      (m) => !prevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      console.log('Adding manager notification:', newManagers[0]);
      setNotifications((prev) => [...prev, { type: 'manager', id: newManagers[0] }]);
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      console.log('Adding artifact notification:', newArtifacts[0]);
      setNotifications((prev) => [...prev, { type: 'artifact', id: newArtifacts[0] }]);
    }

    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      console.log('Adding achievement notification:', newAchievements[0].id);
      setNotifications((prev) => [...prev, { type: 'achievement', id: newAchievements[0].id }]);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = (index: number) => {
    console.log('Closing notification at index:', index);
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
