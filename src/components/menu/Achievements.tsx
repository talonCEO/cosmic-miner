import React from 'react';
import { Award } from 'lucide-react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameState } from '@/context/GameContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from 'framer-motion';

interface AchievementsProps {
  achievements: GameState['achievements'];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const achievementProgress = () => {
    const unlocked = achievements.filter(a => a.unlocked).length;
    const total = achievements.length;
    return { unlocked, total, percentage: total > 0 ? (unlocked / total) * 100 : 0 };
  };

  const progress = achievementProgress();

  // Animation variants for the title
  const titleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: 'easeOut', 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      } 
    },
  };

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Achievements</DialogTitle>
      </DialogHeader>
      
      <ScrollArea className="h-[60vh]">
        <div className="p-6">
          <div className="mb-4 bg-slate-800/50 rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{progress.unlocked}/{progress.total} ({Math.round(progress.percentage)}%)</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-start p-3 rounded-lg border ${
                  achievement.unlocked
                    ? "border-indigo-500/30 bg-indigo-900/20"
                    : "border-slate-700/30 bg-slate-800/20 opacity-60"
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <Award size={24} className={achievement.unlocked ? "text-yellow-400" : "text-slate-400"} />
                </div>
                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-medium text-base">
                    {achievement.name}
                    {achievement.unlocked && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-2">Unlocked</span>}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">{achievement.description}</p>
                </div>
                {/* Rewards */}
                <div className="w-16 flex items-center justify-center ml-3">
                {achievement.rewards && (
  <div className="text-center">
    {achievement.rewards.type === 'title' ? (
      achievement.unlocked ? (
        <motion.strong
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="block text-xs font-bold uppercase text-indigo-300"
        >
          {achievement.rewards.image}
        </motion.strong>
      ) : (
        <strong className="block text-xs font-bold uppercase text-indigo-300">
          {achievement.rewards.image}
        </strong>
      )
    ) : achievement.rewards.type === 'gems' ? (
      <>
        <img
          src={achievement.rewards.image}
          alt="Gems"
          className="w-8 h-8 mx-auto"
          onError={() => console.error(`Failed to load gem icon for ${achievement.id}`)}
        />
        <span className="text-xs text-slate-300">
          {achievement.rewards.value} Gems
        </span>
      </>
    ) : achievement.rewards.type === 'portrait' ? (
      <img
        src={achievement.rewards.image}
        alt="Portrait"
        className="w-12 h-12 mx-auto"
        onError={() => console.error(`Failed to load portrait icon for ${achievement.id}`)}
      />
    ) : null}
  </div>
)}
                </div>
              </div>
            ))}
            
            {achievements.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <p>No achievements available yet</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-indigo-500/20 mt-auto">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Achievements;
