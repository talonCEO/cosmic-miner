
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Lock, Check, Edit2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { getUnlockedPortraits, getUnlockedTitles, getLevelFromExp, PORTRAITS, TITLES } from '@/data/playerProgressionData';

interface EditCustomizationProps {
  onClose: () => void;
}

const EditCustomization: React.FC<EditCustomizationProps> = ({ onClose }) => {
  const { state, updatePortrait, updateTitle, updateUsername } = useGame();
  const [selectedPortrait, setSelectedPortrait] = useState(state.portrait);
  const [selectedTitle, setSelectedTitle] = useState(state.title);
  const [isEditingName, setIsEditingName] = useState(false);
  const [username, setUsername] = useState(state.username || "");
  const [usernameError, setUsernameError] = useState("");

  const nameChangeCount = state.nameChangeCount || 0;
  const nameChangeCost = nameChangeCount === 0 ? 0 : 200;
  const canEditName = nameChangeCost === 0 || state.gems >= nameChangeCost;

  const levelData = getLevelFromExp(state.totalEarned || 0);
  const unlockedPortraitIds = getUnlockedPortraits(
    levelData.currentLevel.level, 
    state.achievements.map(a => a.id),
    state.prestigeCount || 0,
    true // Unlock all portraits by default
  ).map(p => p.id);
  const unlockedTitleIds = getUnlockedTitles(
    levelData.currentLevel.level, 
    state.achievements.map(a => a.id),
    state.prestigeCount || 0,
    true // Unlock all titles by default
  ).map(t => t.id);

  const handleSaveName = () => {
    if (!username.trim() || username === state.username) {
      setIsEditingName(false);
      return;
    }
    
    if (nameChangeCost > 0 && state.gems < nameChangeCost) {
      setUsernameError("Not enough gems! You need 200 gems to change your username.");
      return;
    }
    
    updateUsername(username);
    setIsEditingName(false);
    setUsernameError("");
  };

  const handleApply = () => {
    if (selectedPortrait !== state.portrait && unlockedPortraitIds.includes(selectedPortrait)) {
      updatePortrait(selectedPortrait);
    }
    if (selectedTitle !== state.title && unlockedTitleIds.includes(selectedTitle)) {
      updateTitle(selectedTitle);
    }
    onClose(); // Close after applying
  };

  return (
    <DialogContent className="max-w-[280px] max-h-[350px] backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[10000]">
      <DialogHeader className="p-2 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-lg">Customize</DialogTitle>
      </DialogHeader>
      <div className="p-2 space-y-2">
        <div>
          <label className="text-xs text-slate-300 mb-0.5 block">Username</label>
          <div className="flex gap-1 mb-0.5">
            {isEditingName ? (
              <>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white flex-1"
                  maxLength={15}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleSaveName}
                  title="Save username"
                >
                  <Check size={14} className="text-green-400" />
                </Button>
              </>
            ) : (
              <>
                <div className="h-8 text-sm bg-indigo-700/50 border border-indigo-500 text-white rounded-md px-3 py-1.5 flex-1 truncate">
                  {state.username}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditingName(true)}
                  disabled={!canEditName}
                  title={canEditName ? "Edit username" : "Not enough gems"}
                >
                  <Edit2 size={14} className={canEditName ? "text-slate-300" : "text-slate-500"} />
                </Button>
              </>
            )}
          </div>
          {nameChangeCount > 0 && (
            <span className="text-xs text-purple-400 flex items-center gap-1">
              Cost: 200 gems
            </span>
          )}
          {usernameError && (
            <span className="text-xs text-red-400 block mt-1">{usernameError}</span>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-300 mb-0.5 block">Portrait</label>
          <Select value={selectedPortrait} onValueChange={setSelectedPortrait}>
            <SelectTrigger className="w-full h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white">
              <SelectValue placeholder="Select Portrait" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto z-[10001]">
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
            <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto z-[10001]">
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
