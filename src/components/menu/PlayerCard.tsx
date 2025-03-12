import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  playerName: string;
  playerRank: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  gems: number;
  essence: number;
  onNameChange: (newName: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerRank,
  playerLevel,
  playerExp,
  playerMaxExp,
  coins,
  gems,
  essence,
  onNameChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playerName);
  const [animateExp, setAnimateExp] = useState(false);
  const expPercentage = (playerExp / playerMaxExp) * 100;

  const playerUID = React.useMemo(() => {
    return Math.floor(10000000 + Math.random() * 90000000);
  }, []);

  useEffect(() => {
    setAnimateExp(true);
  }, [playerExp]);

  const handleSaveName = () => {
    if (name.trim()) {
      onNameChange(name);
      setIsEditing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <motion.div
      className="w-full bg-gradient-to-br from-indigo-900/80 to-indigo-700/80 rounded-xl p-4 border border-indigo-400/20 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-4 w-full flex-wrap">
        {/* Left: Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-amber-400/60 rounded-full shadow-md shadow-amber-500/30 hover:scale-105 transition-transform duration-200">
            <AvatarImage src="/placeholder.svg" alt="Player avatar" />
            <AvatarFallback className="bg-indigo-600/60 text-white text-xl font-semibold">
              {playerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            Lvl {playerLevel}
          </div>
        </div>

        {/* Middle: Player Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2 w-full">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-white bg-indigo-800/50 border-indigo-400/50 rounded-md shadow-inner w-full max-w-[200px]"
                maxLength={15}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 p-0 bg-green-500/20 hover:bg-green-500/40 rounded-full flex-shrink-0"
                onClick={handleSaveName}
              >
                <Check size={16} className="text-green-300" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center mb-2 w-full">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 p-0 mr-2 hover:bg-indigo-500/30 rounded-full flex-shrink-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} className="text-indigo-300" />
              </Button>
              <h3 className="text-lg font-bold text-white tracking-tight truncate">{playerName}</h3>
              <span className="text-sm text-indigo-300/50 ml-2 font-mono flex-shrink-0">#{playerUID}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm px-2 py-1 rounded-md font-semibold shadow shadow-purple-500/30 truncate">
              {playerRank}
            </div>
          </div>

          <div className="space-y-1 w-full">
            <div className="flex justify-between text-xs text-indigo-200">
              <span>XP</span>
              <span>{playerExp}/{playerMaxExp}</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${animateExp ? expPercentage : 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              onAnimationComplete={() => setAnimateExp(false)}
            >
              <Progress
                value={100}
                className="h-2 bg-indigo-800/50 rounded-full overflow-hidden w-full"
                indicatorClassName="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 shadow-inner"
              />
            </motion.div>
          </div>
        </div>

        {/* Right: Currency Info */}
        <div className="flex flex-col space-y-2 w-full sm:w-auto sm:max-w-[120px] bg-indigo-800/30 p-3 rounded-lg border border-indigo-500/20 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-amber-300 text-sm font-semibold flex items-center truncate">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-1 flex-shrink-0" />
              Coins
            </span>
            <span className="text-white text-sm font-mono">{formatCurrency(coins)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm font-semibold flex items-center truncate">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-1 flex-shrink-0" />
              Gems
            </span>
            <span className="text-white text-sm font-mono">{formatCurrency(gems)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-300 text-sm font-semibold flex items-center truncate">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 flex-shrink-0" />
              Essence
            </span>
            <span className="text-white text-sm font-mono">{formatCurrency(essence)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
