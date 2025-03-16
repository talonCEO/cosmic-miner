import React from 'react';

interface GemPackageProps {
  pack: {
    id: string;
    name: string;
    amount: number;
    price: string;
    description: string;
    image: string; // Added image field
  };
  onPurchase: () => void;
}

const GemPackage: React.FC<GemPackageProps> = ({ pack, onPurchase }) => {
  return (
    <button
      onClick={onPurchase}
      className="w-full flex flex-col items-center p-4 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 hover:from-amber-900/50 hover:to-yellow-900/50 transition-colors"
    >
      <img
        src={pack.image}
        alt={pack.name}
        className="w-16 h-16 mb-2 object-contain" // Adjust size as needed (e.g., match 60x60 from TechTree.tsx)
      />
      <h3 className="text-sm font-medium text-amber-200 mb-1">{pack.name}</h3>
      <div className="text-yellow-400 font-semibold mb-1">{pack.amount} Gems</div>
      <span className="text-lg font-bold text-green-400">{pack.price}</span>
    </button>
  );
};

export default GemPackage;
