
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { getUnlockedPortraits, getUnlockedTitles, getLevelFromExp, PORTRAITS, TITLES } from '@/data/playerProgressionData';

interface EditCustomizationProps {
  onClose: () => void;
}

const EditCustomization: React.FC<EditCustomizationProps> = ({ onClose }) => {
  const { state, updatePortrait, updateTitle } = useGame();
  const [selectedPortrait, setSelectedPortrait] = useState(state.portrait);
  const [selectedTitle, setSelectedTitle] = useState(state.title);

  const levelData = getLevelFromExp(state.totalEarned || 0);
  // Add unlockAll: true to unlock everything
  const unlockedPortraitIds = getUnlockedPortraits(
    levelData.currentLevel.level, 
    state.achievements.map(a => a.id),
    state.prestigeCount || 0, // Assuming prestigeCount is in state
    true // Unlock all portraits
  ).map(p => p.id);
  const unlockedTitleIds = getUnlockedTitles(
    levelData.currentLevel.level, 
    state.achievements.map(a => a.id),
    state.prestigeCount || 0, // Assuming prestigeCount is in state
    true // Unlock all titles
  ).map(t => t.id);

  // Rest of the code remains unchanged
  const handleApply = () => {
    if (selectedPortrait !== state.portrait && unlockedPortraitIds.includes(selectedPortrait)) {
      updatePortrait(selectedPortrait);
    }
    if (selectedTitle !== state.title && unlockedTitleIds.includes(selectedTitle)) {
      updateTitle(selectedTitle);
    }
    onClose();
  };

  // ... rest of the component ...
};

  return (
    <DialogContent className="max-w-[200px] max-h-[250px] backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[10000]">
      <DialogHeader className="p-2 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-lg">Customize</DialogTitle>
      </DialogHeader>
      <div className="p-2 space-y-2">
        <div>
          <label className="text-xs text-slate-300 mb-0.5 block">Portrait</label>
          <Select value={selectedPortrait} onValueChange={setSelectedPortrait}>
            <SelectTrigger className="w-full h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white">
              <SelectValue placeholder="Select Portrait" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto">
              {PORTRAITS.map(portrait => {
                const isUnlocked = unlockedPortraitIds.includes(portrait.id);
                return (
                  <SelectItem
                    key={portrait.id}
                    value={portrait.id}
                    className={`text-sm flex items-center ${isUnlocked ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isUnlocked}
                  >
                    <div className="flex items-center w-full">
                      <span>{portrait.name}</span>
                      {!isUnlocked && <Lock size={12} className="ml-auto text-gray-400" />}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-300 mb-0.5 block">Title</label>
          <Select value={selectedTitle} onValueChange={setSelectedTitle}>
            <SelectTrigger className="w-full h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white">
              <SelectValue placeholder="Select Title" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto">
              {TITLES.map(title => {
                const isUnlocked = unlockedTitleIds.includes(title.id);
                return (
                  <SelectItem
                    key={title.id}
                    value={title.id}
                    className={`text-sm flex items-center ${isUnlocked ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isUnlocked}
                  >
                    <div className="flex items-center w-full">
                      <span>{title.name}</span>
                      {!isUnlocked && <Lock size={12} className="ml-auto text-gray-400" />}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-1 pt-1">
          <Button
            onClick={handleApply}
            className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs h-7 px-2"
          >
            Apply
          </Button>
          <Button
            onClick={onClose}
            className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs h-7 px-2"
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default EditCustomization;
