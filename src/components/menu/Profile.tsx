
import React, { useState } from 'react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tab, Tabs, TabPanel, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/context/FirebaseContext";
import { useGame } from "@/context/GameContext";
import { getLevelFromExp } from '@/data/playerProgressionData';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { MenuType } from './types';

interface ProfileProps {
  setMenuType: (menuType: MenuType) => void;
}

const Profile: React.FC<ProfileProps> = ({ setMenuType }) => {
  const { profile, updateUsername, updateTitle } = useFirebase();
  const { state } = useGame();
  const [selectedTab, setSelectedTab] = useState("info");
  
  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  const handleNameChange = (newName: string) => {
    if (newName && newName !== profile.username) {
      updateUsername(newName);
    }
  };
  
  const handleTitleChange = (titleId: string) => {
    if (titleId && titleId !== profile.title) {
      updateTitle(titleId);
    }
  };
  
  const levelData = getLevelFromExp(profile.exp || 0);
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Profile</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          View and edit your cosmic explorer profile
        </DialogDescription>
      </DialogHeader>
      
      <div className="p-4">
        {/* Player Card */}
        <PlayerCard 
          playerName={profile.username}
          playerTitle={profile.title}
          playerLevel={profile.level || 1}
          playerExp={profile.exp || 0}
          playerMaxExp={levelData.nextLevel ? levelData.nextLevel.expRequired : levelData.currentLevel.expRequired}
          coins={profile.coins || 0}
          gems={profile.gems || 0}
          essence={profile.essence || 0}
          onNameChange={handleNameChange}
          userId={profile.userId}
        />
        
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="p-4 bg-indigo-900/20 rounded-md mt-4 border border-indigo-500/20">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Player ID</h3>
                <div className="bg-slate-800/50 p-2 rounded-md text-slate-300 text-sm">
                  {profile.userId}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Achievements</h3>
                <div className="bg-slate-800/50 p-2 rounded-md text-slate-300 text-sm">
                  {profile.achievements?.length || 0} / 50 Unlocked
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 w-full text-indigo-300 hover:text-indigo-200"
                  onClick={() => setMenuType("achievements")}
                >
                  View Achievements
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Titles</h3>
                <div className="bg-slate-800/50 p-2 rounded-md text-slate-300 text-sm">
                  {profile.unlockedTitles?.length || 0} Titles Unlocked
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="friends" className="p-4 bg-indigo-900/20 rounded-md mt-4 border border-indigo-500/20">
            <PlayerFriends friends={profile.friends || []} />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Profile;
