import React from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFirebase } from '@/context/FirebaseContext';
import { Crown, Medal, Star } from 'lucide-react';

// Interface for leaderboard entry
interface LeaderboardEntry {
  id: string;
  name: string;
  title: string;
  level: number;
  galacticRank: number;
  exp: number;
  avatarUrl?: string;
}

const Leaderboard: React.FC = () => {
  const { profile } = useFirebase();
  
  // Generate 10 placeholder accounts for the leaderboard
  const generatePlaceholderAccounts = (): LeaderboardEntry[] => {
    // Base names for placeholder accounts
    const baseNames = [
      "CosmicNinja", "StarDancer", "GalaxyRider", 
      "NebulaDrifter", "SolarFlare", "AstroHunter", 
      "OrbitalStriker", "VoidWanderer", "PlanetCrusher", 
      "MeteorMaster"
    ];
    
    // Titles for placeholder accounts
    const titles = [
      "Space Pilot", "Asteroid Miner", "Star Explorer", 
      "Galactic Pioneer", "Nebula Navigator", "Cosmic Voyager", 
      "Celestial Commander", "Solar Sovereign", "Interstellar Emperor", 
      "Galactic Overlord"
    ];
    
    // Create placeholder accounts with increasing levels and galactic ranks
    return baseNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name + (Math.floor(Math.random() * 1000)).toString(),
      title: titles[Math.min(index, titles.length - 1)],
      level: Math.floor(80 + Math.random() * 20), // Level 80-100
      galacticRank: 5000 - (index * 500) - Math.floor(Math.random() * 300), // 5000 to 0
      exp: Math.floor(10000000 + Math.random() * 90000000), // Random high exp
      avatarUrl: undefined
    }));
  };
  
  // Get or generate leaderboard data
  const leaderboardData = generatePlaceholderAccounts();
  
  // Insert current player if they exist
  if (profile) {
    // Remove last entry to keep total at 10
    leaderboardData.pop();
    
    // Add current player at a random position between 3 and 8
    const playerPosition = Math.floor(3 + Math.random() * 5);
    
    // Create player entry
    const playerEntry: LeaderboardEntry = {
      id: profile.userId,
      name: profile.username,
      title: profile.title,
      level: profile.level,
      galacticRank: 5000 - (playerPosition * 500) - Math.floor(Math.random() * 300),
      exp: profile.exp,
      avatarUrl: undefined
    };
    
    // Insert player at the selected position
    leaderboardData.splice(playerPosition, 0, playerEntry);
  }
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Cosmic Leaderboard</DialogTitle>
      </DialogHeader>
      
      <div className="py-2 px-3">
        <div className="flex items-center justify-between p-2 border-b border-indigo-500/20 text-sm text-slate-300">
          <span className="w-10 text-center">Rank</span>
          <span className="flex-1 ml-2">Player</span>
          <span className="w-14 text-center">Level</span>
          <span className="w-20 text-right">Rating</span>
        </div>
        
        <div className="space-y-1 mt-1">
          {leaderboardData.map((entry, index) => {
            // Determine if this entry is for the current player
            const isCurrentPlayer = profile && entry.id === profile.userId;
            
            // Determine ranking styles
            let rankElement;
            let rowStyles = "";
            
            if (index === 0) {
              // 1st place - Gold
              rankElement = <Crown size={18} className="text-yellow-400" />;
              rowStyles = "bg-yellow-950/30";
            } else if (index === 1) {
              // 2nd place - Silver
              rankElement = <Medal size={18} className="text-slate-300" />;
              rowStyles = "bg-slate-800/30";
            } else if (index === 2) {
              // 3rd place - Bronze
              rankElement = <Medal size={18} className="text-amber-700" />;
              rowStyles = "bg-amber-950/30";
            } else {
              // Normal rank
              rankElement = <span>{index + 1}</span>;
              rowStyles = isCurrentPlayer ? "bg-indigo-900/30" : "";
            }
            
            return (
              <div 
                key={entry.id} 
                className={`flex items-center p-2 rounded-md ${rowStyles} ${isCurrentPlayer ? "border border-indigo-500/50" : ""}`}
              >
                <div className="w-10 flex justify-center items-center">
                  {rankElement}
                </div>
                
                <div className="flex-1 flex items-center">
                  <Avatar className={`h-8 w-8 mr-2 ${index < 3 ? "border-2 border-" + (index === 0 ? "yellow-400" : index === 1 ? "slate-300" : "amber-700") : ""}`}>
                    <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                    <AvatarFallback className="bg-indigo-700/50 text-white text-xs">
                      {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="text-sm font-medium text-white flex items-center">
                      {entry.name} 
                      {isCurrentPlayer && <span className="ml-1 text-xs px-1.5 py-0.5 bg-indigo-500/50 rounded-sm">You</span>}
                    </div>
                    <div className="text-xs text-slate-400">{entry.title}</div>
                  </div>
                </div>
                
                <div className="w-14 text-center">
                  <div className="flex items-center justify-center">
                    <Star size={12} className="text-yellow-500 mr-0.5" />
                    <span className="text-sm">{entry.level}</span>
                  </div>
                </div>
                
                <div className="w-20 text-right text-sm font-medium">
                  {entry.galacticRank}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 mt-auto border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Leaderboard;
