import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Flame,
  Key,
  Lock,
  Moon,
  Sun,
  Cloud,
  Droplet,
  Leaf,
  Snowflake,
  Wind,
  Anchor,
  Bell,
  Camera,
  Compass,
  Feather,
  Globe,
} from 'lucide-react';

interface ArtifactShopItemProps {
  artifact: {
    id: string;
    name: string;
    description: string;
    bonus: string;
    avatar: string;
    cost: number;
  };
  isOwned: boolean;
  canAfford: boolean;
  onBuy: () => void;
}

// Placeholder: Assuming this is used in a parent component
const artifacts = []; // Replace with actual import from '@/utils/artifactsData'

const ArtifactShopItem: React.FC<ArtifactShopItemProps> = ({ 
  artifact, 
  isOwned, 
  canAfford, 
  onBuy
}) => {
  return (
    <div 
      key={artifact.id} 
      className={`rounded-lg border p-3 transition ${
        isOwned 
          ? "border-green-500/30 bg-green-900/10" 
          : canAfford 
            ? "border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/20" 
            : "border-slate-700/30 bg-slate-800/10 opacity-70"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
          <AvatarImage src={artifact.avatar} alt={artifact.name} />
          <AvatarFallback className="bg-purple-700/50">
            {artifact.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="font-medium text-sm truncate">{artifact.name}</h3>
          <p className="text-xs text-slate-300 truncate">{artifact.description}</p>
        </div>
      </div>
      <p className="text-xs text-purple-400 mb-2 break-words">{artifact.bonus}</p>
      
      {isOwned ? (
        <div className="bg-green-900/20 text-green-400 text-center py-1 rounded text-sm font-medium">
          Owned
        </div>
      ) : (
        <button
          onClick={onBuy}
          className={`w-full py-1 px-2 rounded text-sm font-medium ${
            canAfford 
              ? "bg-purple-600 text-white hover:bg-purple-700" 
              : "bg-slate-700 text-slate-300 cursor-not-allowed"
          }`}
          disabled={!canAfford}
        >
          <span className="flex items-center justify-center gap-1">
            <Flame size={12} className="text-white" />
            <span>{artifact.cost}</span>
          </span>
        </button>
      )}
    </div>
  );
};

// Example parent wrapper for ArtifactShopItem
const ArtifactShopExample: React.FC = () => {
  const artifactIcons = [
    <Flame size={12} className="text-orange-400" />,
    <Key size={12} className="text-yellow-500" />,
    <Lock size={12} className="text-gray-400" />,
    <Moon size={12} className="text-indigo-400" />,
    <Sun size={12} className="text-yellow-300" />,
    <Cloud size={12} className="text-blue-300" />,
    <Droplet size={12} className="text-cyan-400" />,
    <Leaf size={12} className="text-green-400" />,
    <Snowflake size={12} className="text-blue-500" />,
    <Wind size={12} className="text-teal-300" />,
    <Anchor size={12} className="text-gray-500" />,
    <Bell size={12} className="text-amber-400" />,
    <Camera size={12} className="text-purple-400" />,
    <Compass size={12} className="text-red-400" />,
    <Feather size={12} className="text-pink-300" />,
    <Globe size={12} className="text-green-500" />,
  ];

  const artifactIconMap = new Map<string, React.ReactNode>();
  artifacts.forEach((artifact, index) => {
    artifactIconMap.set(artifact.id, artifactIcons[index % artifactIcons.length]);
  });

  const isOwned = (id: string) => false;
  const canAfford = (cost: number) => true;
  const handleBuy = (id: string) => console.log(`Buying ${id}`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {artifacts.map(artifact => (
        <ArtifactShopItem
          key={artifact.id}
          artifact={{
            id: artifact.id,
            name: artifact.name,
            description: artifact.description,
            bonus: artifact.bonus,
            avatar: artifact.avatar,
            cost: artifact.cost
          }}
          isOwned={isOwned(artifact.id)}
          canAfford={canAfford(artifact.cost)}
          onBuy={() => handleBuy(artifact.id)}
        />
      ))}
    </div>
  );
};

export default ArtifactShopItem;
export type { ArtifactShopItemProps };
