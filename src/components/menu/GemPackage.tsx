
import React from 'react';
import { Sparkles } from 'lucide-react';
import type { GemPackage } from './types/premiumStore';
import { useToast } from '@/components/ui/use-toast';

interface GemPackageProps {
  pack: GemPackage;
}

const GemPackage: React.FC<GemPackageProps> = ({ pack }) => {
  const { toast } = useToast();

  const handlePurchase = () => {
    // TODO: Implement Google Play billing
    toast({
      title: "Coming Soon",
      description: "Google Play billing will be implemented soon!",
    });
  };

  return (
    <button
      onClick={handlePurchase}
      className="flex flex-col items-center p-4 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 hover:from-amber-900/50 hover:to-yellow-900/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-400 font-semibold">{pack.amount}</span>
      </div>
      <h3 className="text-sm font-medium text-amber-200 mb-1">{pack.name}</h3>
      <p className="text-xs text-amber-300/70 mb-2">{pack.description}</p>
      <span className="text-lg font-bold text-green-400">{pack.price}</span>
    </button>
  );
};

export default GemPackage;
