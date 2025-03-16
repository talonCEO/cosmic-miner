
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerCardProps {
  username: string;
  avatar: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievements: string[];
}

const PlayerCard = ({ 
  username, 
  avatar, 
  level, 
  experience, 
  nextLevelExp, 
  achievements 
}: PlayerCardProps) => {
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    // Calculate the percentage progress to next level
    const percentage = Math.min(100, Math.max(0, (experience / nextLevelExp) * 100));
    
    // Animate the progress bar
    setProgressValue(0);
    const timeout = setTimeout(() => {
      setProgressValue(percentage);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [experience, nextLevelExp]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
    >
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary">
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2 bg-primary text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-background">
            {level}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">{username}</h2>
          
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Level {level}</span>
              <span className="font-medium">{experience} / {nextLevelExp} XP</span>
            </div>
            <div className="relative">
              <Progress 
                value={progressValue} 
                className="h-3 bg-background/50" 
              />
              <AnimatePresence>
                {progressValue > 0 && progressValue < 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute left-0 top-0 h-3 bg-primary/20 rounded-full"
                    style={{ width: `${progressValue}%` }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {achievements && achievements.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Recent Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 5).map((achievement, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                {achievement}
              </Badge>
            ))}
            {achievements.length > 5 && (
              <Badge variant="outline">+{achievements.length - 5} more</Badge>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerCard;
