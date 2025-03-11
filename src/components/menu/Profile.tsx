
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import { Activity, Clock, TrendingUp, Zap, BarChart3, Trophy, Target, Coins } from 'lucide-react';

const Profile: React.FC = () => {
  const { state } = useGame();
  
  // Mock player data - in a real implementation, this would come from the game state
  const playerData = {
    name: "Cosmic Explorer",
    rank: "Space Adventurer",
    level: state.prestigeCount + 1,
    exp: state.totalEarned % 1000,
    maxExp: 1000
  };
  
  const handleNameChange = (newName: string) => {
    console.log("Player name changed to:", newName);
    // In a real implementation, update this in the game state
  };
  
  const metrics = [
    {
      label: "Total Clicks",
      value: formatNumber(state.totalClicks),
      icon: <Target className="text-red-400" size={18} />
    },
    {
      label: "Total Earned",
      value: formatNumber(state.totalEarned),
      icon: <Coins className="text-yellow-400" size={18} />
    },
    {
      label: "Prestige Count",
      value: state.prestigeCount,
      icon: <Trophy className="text-amber-400" size={18} />
    },
    {
      label: "Income Multiplier",
      value: `${state.incomeMultiplier.toFixed(1)}x`,
      icon: <TrendingUp className="text-green-400" size={18} />
    },
    {
      label: "Tap Power",
      value: formatNumber(state.coinsPerClick),
      icon: <Zap className="text-blue-400" size={18} />
    },
    {
      label: "Passive Income",
      value: `${formatNumber(state.coinsPerSecond)}/s`,
      icon: <Activity className="text-purple-400" size={18} />
    },
    {
      label: "Skill Points",
      value: state.skillPoints,
      icon: <BarChart3 className="text-indigo-400" size={18} />
    },
    {
      label: "Play Time",
      value: "8h 24m", // This would be calculated in a real implementation
      icon: <Clock className="text-slate-400" size={18} />
    }
  ];
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Player Profile</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] px-4">
        <div className="py-4">
          <PlayerCard 
            playerName={playerData.name}
            playerRank={playerData.rank}
            playerLevel={playerData.level}
            playerExp={playerData.exp}
            playerMaxExp={playerData.maxExp}
            onNameChange={handleNameChange}
          />
          
          <div className="mt-4 bg-indigo-600/10 rounded-lg border border-indigo-500/20 p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Player Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-indigo-700/20 rounded-md p-2 border border-indigo-600/30">
                  <div className="flex items-center gap-2 mb-1">
                    {metric.icon}
                    <span className="text-xs text-slate-300">{metric.label}</span>
                  </div>
                  <div className="text-sm font-medium text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 bg-indigo-600/10 rounded-lg border border-indigo-500/20 p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Achievements Progress</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Total Achievements</span>
                  <span>{state.achievements.filter(a => a.unlocked).length} / {state.achievements.length}</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                    style={{ width: `${(state.achievements.filter(a => a.unlocked).length / state.achievements.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Abilities Unlocked</span>
                  <span>{state.abilities.filter(a => a.unlocked).length} / {state.abilities.length}</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${(state.abilities.filter(a => a.unlocked).length / state.abilities.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Managers Hired</span>
                  <span>{state.ownedManagers.length - 1} / {state.managers.length - 1}</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                    style={{ width: `${((state.ownedManagers.length - 1) / (state.managers.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Artifacts Collected</span>
                  <span>{state.ownedArtifacts.length - 1} / {state.artifacts.length - 1}</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500" 
                    style={{ width: `${((state.ownedArtifacts.length - 1) / (state.artifacts.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Profile;
