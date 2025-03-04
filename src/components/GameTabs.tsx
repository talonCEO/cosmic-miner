
import React, { useState } from 'react';
import Stats from '@/components/Stats';
import Upgrades from '@/components/Upgrades';
import Managers from '@/components/Managers';
import OtherOptions from '@/components/OtherOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GameTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("stats");
  
  return (
    <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
      <TabsList className="grid grid-cols-4 mb-4 backdrop-blur-sm bg-slate-900/50 border border-indigo-500/20">
        <TabsTrigger value="stats" className="data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white">Statistics</TabsTrigger>
        <TabsTrigger value="upgrades" className="data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white">Upgrades</TabsTrigger>
        <TabsTrigger value="managers" className="data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white">Managers</TabsTrigger>
        <TabsTrigger value="other" className="data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white">Other</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats" className="animate-fade-in">
        <Stats />
      </TabsContent>
      
      <TabsContent value="upgrades" className="animate-fade-in">
        <Upgrades />
      </TabsContent>
      
      <TabsContent value="managers" className="animate-fade-in">
        <Managers />
      </TabsContent>
      
      <TabsContent value="other" className="animate-fade-in">
        <OtherOptions />
      </TabsContent>
    </Tabs>
  );
};

export default GameTabs;
