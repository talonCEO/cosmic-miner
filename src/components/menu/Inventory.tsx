
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useGame } from '@/context/GameContext';
import { BoostEffect } from '@/context/GameContext'; // Import BoostEffect type from GameContext
import {
  Coins, Gem, Sparkles, Brain, Clock, Zap, CircleDollarSign, DollarSign, 
  Percent, Star, Rocket, VideoOff, PackagePlus, Box, Search, Trash
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Inventory: React.FC = () => {
  const { state, activateBoost } = useGame();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("items");
  const [filterText, setFilterText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };
  
  const formatRemainingTime = (boost: BoostEffect): string => {
    if (!boost.remainingTime) return 'Permanent';
    
    const currentTime = Date.now();
    const endTime = boost.activatedAt! + boost.duration! * 1000;
    const remainingMs = Math.max(0, endTime - currentTime);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    return formatDuration(remainingSeconds);
  };
  
  const getBoostTypeLabel = (type: string): string => {
    switch (type) {
      case 'coinMultiplier': return 'Coin Multiplier';
      case 'coinsPerClick': return 'Click Power';
      case 'coinsPerClickBase': return 'Base Click Power';
      case 'coinsPerSecond': return 'Passive Income';
      case 'coinsPerSecondBase': return 'Base Passive Income';
      case 'essenceMultiplier': return 'Essence Bonus';
      case 'timeWarp': return 'Time Warp';
      case 'unlockAutoBuy': return 'Auto Buy';
      case 'upgradeCostReduction': return 'Cost Reduction';
      case 'noAds': return 'No Ads';
      case 'autoTap': return 'Auto Tap';
      case 'inventoryCapacity': return 'Inventory Space';
      default: return type;
    }
  };
  
  const getItemIcon = (itemId: string) => {
    // Find the item in inventory
    const item = state.inventory.find(i => i.id === itemId);
    if (item && item.icon) {
      return item.icon;
    }
    
    // Default icons based on item type prefix
    if (itemId.startsWith('resource-coins')) return <Coins />;
    if (itemId.startsWith('resource-gems')) return <Gem />;
    if (itemId.startsWith('resource-essence')) return <Sparkles />;
    if (itemId.startsWith('resource-skillpoints')) return <Brain />;
    if (itemId.startsWith('boost-time')) return <Clock />;
    if (itemId.startsWith('boost-auto-tap')) return <Zap />;
    if (itemId.startsWith('boost-double')) return <CircleDollarSign />;
    if (itemId.startsWith('boost-perma-tap')) return <DollarSign />;
    if (itemId.startsWith('boost-cheap')) return <Percent />;
    if (itemId.startsWith('boost-essence')) return <Sparkles />;
    if (itemId.startsWith('boost-perma-passive')) return <Star />;
    if (itemId.startsWith('boost-no-ads')) return <VideoOff />;
    if (itemId.startsWith('boost-auto-buy')) return <PackagePlus />;
    if (itemId.startsWith('boost-inventory')) return <Box />;
    
    return <Box />;
  };
  
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'bg-slate-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-amber-500 text-black';
      default: return 'bg-slate-500 text-white';
    }
  };
  
  const handleUseItem = (item: any) => {
    if (!item.usable) {
      toast({
        title: "Can't use this item",
        description: "This item cannot be used directly.",
      });
      return;
    }
    
    activateBoost(item.id);
    
    toast({
      title: `Used ${item.name}`,
      description: item.effect?.duration 
        ? `Effect active for ${formatDuration(item.effect.duration)}` 
        : "Effect applied permanently",
    });
    
    setShowDialog(false);
  };
  
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowDialog(true);
  };
  
  const filteredItems = state.inventory.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) || 
    item.description.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Group items by type
  const resources = filteredItems.filter(item => item.type === 'resource');
  const boosts = filteredItems.filter(item => item.type === 'boost');
  const consumables = filteredItems.filter(item => item.type === 'consumable');
  const rewards = filteredItems.filter(item => item.type === 'reward' || item.type === 'gift');
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-200">Inventory</h1>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search items..."
            className="pl-8 pr-4 py-2 bg-slate-800/60 border-slate-700"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-slate-200">Active Effects</h2>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {state.activeBoosts && state.activeBoosts.length > 0 ? (
            state.activeBoosts.map((boost, index) => (
              <Badge key={index} variant="outline" className="bg-slate-700 py-1.5 px-3 gap-2">
                {boost.type === 'coinMultiplier' && <CircleDollarSign className="h-4 w-4 text-green-400" />}
                {boost.type === 'coinsPerClick' && <DollarSign className="h-4 w-4 text-blue-400" />}
                {boost.type === 'coinsPerSecond' && <Clock className="h-4 w-4 text-amber-400" />}
                {boost.type === 'essenceMultiplier' && <Sparkles className="h-4 w-4 text-purple-400" />}
                {boost.type === 'upgradeCostReduction' && <Percent className="h-4 w-4 text-green-400" />}
                {boost.type === 'autoTap' && <Zap className="h-4 w-4 text-yellow-400" />}
                <span>{getBoostTypeLabel(boost.type)}: {boost.value}x</span>
                {boost.remainingTime && (
                  <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">{formatRemainingTime(boost)}</span>
                )}
              </Badge>
            ))
          ) : (
            <p className="text-slate-400 text-sm">No active effects</p>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="items">All Items ({state.inventory.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          <TabsTrigger value="boosts">Boosts ({boosts.length})</TabsTrigger>
          <TabsTrigger value="rewards">Rewards ({rewards.length + consumables.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all" onClick={() => handleItemClick(item)}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getRarityColor(item.rarity)}`}>
                          {getItemIcon(item.id)}
                        </div>
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="resources">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all" onClick={() => handleItemClick(item)}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getRarityColor(item.rarity)}`}>
                          {getItemIcon(item.id)}
                        </div>
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="boosts">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boosts.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all" onClick={() => handleItemClick(item)}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getRarityColor(item.rarity)}`}>
                          {getItemIcon(item.id)}
                        </div>
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <p className="text-xs text-slate-400">{item.description}</p>
                    {item.effect && (
                      <div className="mt-2 text-xs text-slate-300">
                        <span className="font-semibold">Effect: </span>
                        {getBoostTypeLabel(item.effect.type)}: {item.effect.value}x
                        {item.effect.duration && ` for ${formatDuration(item.effect.duration)}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="rewards">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...rewards, ...consumables].map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all" onClick={() => handleItemClick(item)}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getRarityColor(item.rarity)}`}>
                          {getItemIcon(item.id)}
                        </div>
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedItem && (
                <>
                  <div className={`p-1.5 rounded-md ${selectedItem && getRarityColor(selectedItem.rarity)}`}>
                    {selectedItem && getItemIcon(selectedItem.id)}
                  </div>
                  {selectedItem?.name}
                  <Badge variant="outline" className="ml-auto">
                    x{selectedItem?.quantity}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && selectedItem.effect && (
            <div className="bg-slate-800 rounded-md p-3 my-2">
              <h4 className="font-semibold text-slate-200 mb-1">Effect Details</h4>
              <p className="text-sm text-slate-300">
                {getBoostTypeLabel(selectedItem.effect.type)}: {selectedItem.effect.value}x
                {selectedItem.effect.duration && ` for ${formatDuration(selectedItem.effect.duration)}`}
              </p>
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="info">
              <AccordionTrigger className="text-sm text-slate-300">Item Information</AccordionTrigger>
              <AccordionContent>
                <div className="text-xs space-y-1.5 text-slate-400">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{selectedItem?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rarity:</span>
                    <span className="capitalize">{selectedItem?.rarity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stackable:</span>
                    <span>{selectedItem?.stackable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usable:</span>
                    <span>{selectedItem?.usable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obtained:</span>
                    <span>{selectedItem && new Date(selectedItem.obtained).toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="destructive" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                // Implement discard item functionality
                toast({
                  title: "Item Discarded",
                  description: `You discarded 1 ${selectedItem?.name}`
                });
                setShowDialog(false);
              }}
            >
              <Trash className="h-4 w-4" />
              Discard
            </Button>
            
            {selectedItem?.usable && (
              <Button 
                onClick={() => handleUseItem(selectedItem)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Use Item
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
