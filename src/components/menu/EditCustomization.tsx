import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface EditCustomizationProps {
  onClose: () => void;
}

const EditCustomization: React.FC<EditCustomizationProps> = ({ onClose }) => {
  const { state, updateUsername, updateTitle, updatePortrait } = useGame();
  const [username, setUsername] = useState(state.username);
  const [newUsername, setNewUsername] = useState(state.username);
  const [selectedTitle, setSelectedTitle] = useState(state.title);
  const [selectedPortrait, setSelectedPortrait] = useState(state.portrait);

  const titles = [
    "space_pilot",
    "asteroid_miner",
    "galactic_tycoon",
    "cosmic_explorer",
    "nebula_navigator",
    "quantum_pioneer"
  ];

  const portraits = [
    "default",
    "astronaut",
    "alien",
    "robot",
    "scientist",
    "engineer"
  ];

  const handleSaveUsername = () => {
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    updateUsername(username.trim());
    toast.success("Username updated successfully");
    onClose();
  };

  const handleSaveTitle = () => {
    updateTitle(selectedTitle);
    toast.success("Title updated successfully");
    onClose();
  };

  const handleSavePortrait = () => {
    updatePortrait(selectedPortrait);
    toast.success("Portrait updated successfully");
    onClose();
  };

  return (
    <div>
      <Tabs defaultValue="username" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="username">Username</TabsTrigger>
          <TabsTrigger value="title">Title</TabsTrigger>
          <TabsTrigger value="portrait">Portrait</TabsTrigger>
        </TabsList>
        <TabsContent value="username">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveUsername}>
              Save
            </Button>
          </DialogFooter>
        </TabsContent>
        <TabsContent value="title">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Select Title</Label>
              <div className="flex flex-wrap gap-2">
                {titles.map((title) => (
                  <Button
                    key={title}
                    variant={selectedTitle === title ? "secondary" : "outline"}
                    onClick={() => setSelectedTitle(title)}
                  >
                    {title.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveTitle}>
              Save
            </Button>
          </DialogFooter>
        </TabsContent>
        <TabsContent value="portrait">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="portrait">Select Portrait</Label>
              <div className="flex flex-wrap gap-2">
                {portraits.map((portrait) => (
                  <Button
                    key={portrait}
                    variant={selectedPortrait === portrait ? "secondary" : "outline"}
                    onClick={() => setSelectedPortrait(portrait)}
                  >
                    {portrait}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSavePortrait}>
              Save
            </Button>
          </DialogFooter>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditCustomization;
