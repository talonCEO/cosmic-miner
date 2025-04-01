import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Achievement } from '@/utils/achievementsCreator';
import { Manager } from '@/utils/managersData';
import { Artifact } from '@/utils/artifactsData';

interface UnlockItem {
  type: 'achievement' | 'manager' | 'artifact';
  data: Achievement | Manager | Artifact;
}

const UnlockNotification: React.FC = () => {
  const { state } = useGame();
  const [queue, setQueue] = useState<UnlockItem[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UnlockItem | null>(null);
  const [shownUnlocks, setShownUnlocks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newUnlocks: UnlockItem[] = [];

    state.achievements.forEach((achievement) => {
      const unlockKey = `achievement-${achievement.id}`;
      if (
        achievement.unlocked &&
        !shownUnlocks.has(unlockKey) &&
        !queue.some((item) => item.type === 'achievement' && item.data.id === achievement.id)
      ) {
        newUnlocks.push({ type: 'achievement', data: achievement });
      }
    });

    state.ownedManagers.forEach((managerId) => {
      const manager = state.managers.find((m) => m.id === managerId);
      const unlockKey = `manager-${managerId}`;
      if (
        manager &&
        !shownUnlocks.has(unlockKey) &&
        !queue.some((item) => item.type === 'manager' && item.data.id === managerId)
      ) {
        newUnlocks.push({ type: 'manager', data: manager });
      }
    });

    state.ownedArtifacts.forEach((artifactId) => {
      const artifact = state.artifacts.find((a) => a.id === artifactId);
      const unlockKey = `artifact-${artifactId}`;
      if (
        artifact &&
        !shownUnlocks.has(unlockKey) &&
        !queue.some((item) => item.type === 'artifact' && item.data.id === artifactId)
      ) {
        newUnlocks.push({ type: 'artifact', data: artifact });
      }
    });

    if (newUnlocks.length > 0) {
      setQueue((prev) => [...prev, ...newUnlocks]);
      setShownUnlocks((prev) => {
        const updated = new Set(prev);
        newUnlocks.forEach((item) => updated.add(`${item.type}-${item.data.id}`));
        return updated;
      });
    }
  }, [state.achievements, state.ownedManagers, state.ownedArtifacts, shownUnlocks]);

  useEffect(() => {
    if (!currentNotification && queue.length > 0) {
      setCurrentNotification(queue[0]);
      setQueue((prev) => prev.slice(1));
      setTimeout(() => {
        setCurrentNotification(null);
      }, 3000);
    }
  }, [queue, currentNotification]);

  const renderContent = (item: UnlockItem) => {
    const { type, data } = item;
    let title: string;
    let description: string;
    let image: string | undefined;

    if (type === 'achievement') {
      const achievement = data as Achievement;
      title = achievement.name;
      description = achievement.description;
      image = achievement.rewards?.image; // May be undefined
    } else if (type === 'manager') {
      const manager = data as Manager;
      title = manager.name;
      description = manager.description;
      image = manager.avatar;
    } else {
      const artifact = data as Artifact;
      title = artifact.name;
      description = artifact.description;
      image = artifact.avatar;
    }

    return (
      <div className="flex items-center w-full h-full p-2">
        {/* Left: Title and Description */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-indigo-300">{title}</h3>
          <p className="text-xs text-slate-300">{description}</p>
        </div>
        {/* Right: Reward Display */}
        <div className="w-10 h-10 ml-2 flex items-center justify-center">
          {type === 'achievement' && data.rewards?.type === 'title' ? (
            <strong className="text-xs font-bold uppercase text-indigo-300 text-center">
              {data.rewards.image}
            </strong>
          ) : image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {currentNotification && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-72 h-16 bg-slate-800/90 border border-indigo-500/50 rounded-lg shadow-lg overflow-hidden"
          >
            {renderContent(currentNotification)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnlockNotification;