import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Lock, Gem } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { PORTRAITS, TITLES } from '@/data/playerProgressionData';

interface EditCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditCustomization: React.FC<EditCustomizationProps> = ({ isOpen, onClose }) => {
  const { state, updatePortrait, updateTitle, updateUsername, addGems, dispatch } = useGame();
  const [selectedPortrait, setSelectedPortrait] = useState(state.portrait);
  const [selectedTitle, setSelectedTitle] = useState(state.title);
  const [newUsername, setNewUsername] = useState(state.username);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nameChangeCount = state.nameChangeCount || 0;
  const nameChangeCost = nameChangeCount === 0 ? 0 : 200;
  const canChangeName = nameChangeCost === 0 || state.gems >= nameChangeCost;

  const handleSaveName = () => {
    if (!newUsername.trim() || newUsername === state.username) return;
    if (nameChangeCost > 0 && state.gems < nameChangeCost) {
      setErrorMessage("Not enough gems! Need 200 gems.");
      return;
    }
    if (nameChangeCost > 0) {
      addGems(-nameChangeCost);
    }
    updateUsername(newUsername);
    dispatch({ type: 'UPDATE_NAME_CHANGE_COUNT', count: nameChangeCount + 1 });
    setErrorMessage(null);
  };

  const handleCancel = () => {
    setSelectedPortrait(state.portrait);
    setSelectedTitle(state.title);
    setNewUsername(state.username);
    setErrorMessage(null);
    onClose();
  };

  const handleApply = () => {
    if (selectedPortrait !== state.portrait && state.unlockedPortraits.includes(selectedPortrait)) {
      updatePortrait(selectedPortrait);
    }
    if (selectedTitle !== state.title && state.unlockedTitles.includes(selectedTitle)) {
      updateTitle(selectedTitle);
    }
    if (newUsername !== state.username && (nameChangeCost === 0 || state.gems >= nameChangeCost)) {
      handleSaveName();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-[250px] max-h-[350px] backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[10000]">
        <DialogHeader className="p-2 border-b border-indigo-500/20">
          <DialogTitle className="text-center text-lg">Customize</DialogTitle>
        </DialogHeader>
        <div className="p-2 space-y-2">
          {/* Username Input */}
          <div>
            <label className="text-xs text-slate-300 mb-0.5 block">Username</label>
            <div className="flex items-center gap-2">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="h-8 text-white bg-indigo-700/50 border-indigo-500 w-full"
                maxLength={15}
              />
              <Button
                size="icon"
                className={`h-8 w-8 ${canChangeName ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                onClick={handleSaveName}
                disabled={!canChangeName}
              >
                <Check size={16} className="text-white" />
              </Button>
            </div>
            {errorMessage ? (
              <span className="text-red-400 text-xs mt-1 block">{errorMessage}</span>
            ) : nameChangeCost > 0 && (
              <span className="text-purple-400 text-xs mt-1 flex items-center">
                <Gem size={12} className="mr-1" /> Cost: {nameChangeCost}
              </span>
            )}
          </div>

          {/* Portrait Dropdown */}
          <div>
            <label className="text-xs text-slate-300 mb-0.5 block">Portrait</label>
            <Select value={selectedPortrait} onValueChange={setSelectedPortrait}>
              <SelectTrigger className="w-full h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white">
                <SelectValue placeholder="Select Portrait" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto z-[10001]">
                {PORTRAITS.map(portrait => {
                  const isUnlocked = state.unlockedPortraits.includes(portrait.id);
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

          {/* Title Dropdown */}
          <div>
            <label className="text-xs text-slate-300 mb-0.5 block">Title</label>
            <Select value={selectedTitle} onValueChange={setSelectedTitle}>
              <SelectTrigger className="w-full h-8 text-sm bg-indigo-700/50 border-indigo-500 text-white">
                <SelectValue placeholder="Select Title" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 text-white border-indigo-500 max-h-40 overflow-y-auto z-[10001]">
                {TITLES.map(title => {
                  const isUnlocked = state.unlockedTitles.includes(title.id);
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

          {/* Buttons */}
          <div className="flex justify-end gap-1 pt-1">
            <Button
              onClick={handleApply}
              className="bg-green-600 text-white hover:bg-green-700 text-xs h-7 px-2"
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
    </Dialog>
  );
};

export default EditCustomization;
