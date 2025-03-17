import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/context/GameContext';
import { getUnlockedPortraits, getUnlockedTitles, getLevelFromExp } from '@/data/playerProgressionData';

const EditCustomization: React.FC = () => {
  const { state, updatePortrait, updateTitle } = useGame();
  const [selectedPortrait, setSelectedPortrait] = useState(state.portrait);
  const [selectedTitle, setSelectedTitle] = useState(state.title);

  const levelData = getLevelFromExp(state.totalEarned || 0);
  const unlockedPortraits = getUnlockedPortraits(levelData.currentLevel.level, state.achievements.map(a => a.id));
  const unlockedTitles = getUnlockedTitles(levelData.currentLevel.level, state.achievements.map(a => a.id));

  const handleApply = () => {
    if (selectedPortrait !== state.portrait) {
      updatePortrait(selectedPortrait);
    }
    if (selectedTitle !== state.title) {
      updateTitle(selectedTitle);
    }
  };

  return (
    <DialogContent className="sm:max-w-md backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[10000]">
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Edit Customization</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Portrait</label>
          <Select value={selectedPortrait} onValueChange={setSelectedPortrait}>
            <SelectTrigger className="w-full bg-indigo-700/50 border-indigo-500 text-white">
              <SelectValue placeholder="Select Portrait" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 text-white border-indigo-500">
              {unlockedPortraits.map(portrait => (
                <SelectItem key={portrait.id} value={portrait.id}>
                  {portrait.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Title</label>
          <Select value={selectedTitle} onValueChange={setSelectedTitle}>
            <SelectTrigger className="w-full bg-indigo-700/50 border-indigo-500 text-white">
              <SelectValue placeholder="Select Title" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 text-white border-indigo-500">
              {unlockedTitles.map(title => (
                <SelectItem key={title.id} value={title.id}>
                  {title.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleApply}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            className="border-indigo-500 text-white hover:bg-indigo-700/50"
            onClick={() => document.querySelector('dialog')?.close()} // Manual close
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default EditCustomization;
