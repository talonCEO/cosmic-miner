
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

const ArtifactShopItem: React.FC<ArtifactShopItemProps> = ({ 
  artifact, 
  isOwned, 
  canAfford, 
  onBuy
}) => {
  return (
    <div 
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

export default ArtifactShopItem;
export type { ArtifactShopItemProps };
