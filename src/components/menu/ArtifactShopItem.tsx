import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Since this is standalone, we'll define icons here or expect them from a parent
import { 
  Zap,
  DollarSign,
  BarChart,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Battery,
  Gem,
  Sparkles,
  Trophy,
  Settings,
  Users,
  Lightbulb,
  Brain,
  Heart,
} from 'lucide-react';

interface ArtifactShopItemProps {
  id: string;
  name: string;
  description: string;
  bonus: string;
  avatar: string;
  cost: number;
  isOwned: boolean;
  canAfford: boolean;
  onBuy: () => void;
  additionalInfo?: string;
  icon?: React.ReactNode; // Add icon prop
}

// Placeholder: If used standalone without a parent, we'd need artifact data here
const artifacts = []; // Replace with actual import if standalone

const ArtifactShopItem: React.FC<ArtifactShopItemProps> = ({ 
  id, 
  name, 
  description, 
  bonus, 
  avatar, 
  cost, 
  isOwned, 
  canAfford, 
  onBuy,
  additionalInfo,
  icon,
}) => {
  return (
    <div 
      key={id} 
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
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-purple-700/50">
            {name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <p className="text-xs text-slate-300 truncate">{description}</p>
        </div>
      </div>
      <p className="text-xs text-purple-400 mb-2 break-words">{bonus}</p>
      
      {additionalInfo && (
        <p className="text-xs text-amber-400 mb-2">{additionalInfo}</p>
      )}
      
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
            {icon || <Sparkles size={12} className="text-white" />} {/* Use passed icon or fallback */}
            <span>{cost}</span>
          </span>
        </button>
      )}
    </div>
  );
};

// If used standalone, you'd need this (example parent wrapper)
const ArtifactShopExample: React.FC = () => {
  const artifactIcons = [
    <Zap size={12} className="text-yellow-400" />,
    <DollarSign size={12} className="text-green-500" />,
    <BarChart size={12} className="text-blue-400" />,
    <Clock size={12} className="text-amber-300" />,
    <Shield size={12} className="text-red-400" />,
    <Star size={12} className="text-purple-500" />,
    <TrendingUp size={12} className="text-indigo-400" />,
    <Battery size={12} className="text-cyan-300" />,
    <Gem size={12} className="text-teal-400" />,
    <Sparkles size={12} className="text-amber-400" />,
    <Trophy size={12} className="text-yellow-500" />,
    <Settings size={12} className="text-gray-400" />,
    <Users size={12} className="text-green-300" />,
    <Lightbulb size={12} className="text-orange-400" />,
    <Brain size={12} className="text-blue-500" />,
    <Heart size={12} className="text-pink-400" />,
  ];

  const artifactIconMap = new Map<string, React.ReactNode>();
  artifacts.forEach((artifact, index) => {
    artifactIconMap.set(artifact.id, artifactIcons[index % artifactIcons.length]);
  });

  // Placeholder logic
  const isOwned = (id: string) => false;
  const canAfford = (cost: number) => true;
  const handleBuy = (id: string) => console.log(`Buying ${id}`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {artifacts.map(artifact => (
        <ArtifactShopItem
          key={artifact.id}
          id={artifact.id}
          name={artifact.name}
          description={artifact.description}
          bonus={artifact.bonus}
          avatar={artifact.avatar}
          cost={artifact.cost}
          isOwned={isOwned(artifact.id)}
          canAfford={canAfford(artifact.cost)}
          onBuy={() => handleBuy(artifact.id)}
          additionalInfo={artifact.additionalInfo}
          icon={artifactIconMap.get(artifact.id)}
        />
      ))}
    </div>
  );
};

export default ArtifactShopItem;
// Export ArtifactShopExample separately if needed
