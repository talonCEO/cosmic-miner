import React from 'react';
import { useGame } from '@/context/GameContext';
import { Medal } from 'lucide-react';
import hiddenSprite from '@/assets/hidden.png';
import bronzeMedal from '@/assets/images/icons/bronze.png';
import silverMedal from '@/assets/images/icons/silver.png';
import goldMedal from '@/assets/images/icons/gold.png';

interface WorldItemProps {
  world: {
    id: number;
    name: string;
    sprite: string;
    description: string;
    boosts: Record<string, number>;
    difficulty: number;
    locked: boolean;
    upgradeProgress?: number; // Made optional to reflect potential absence
    medals?: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
  };
  isCurrent: boolean;
  onTravel: () => void;
}

// TravelButton Component
const TravelButton: React.FC<{ locked: boolean; isCurrent: boolean; onClick: () => void }> = ({ locked, isCurrent, onClick }) => (
  <button
    onClick={!locked && !isCurrent ? onClick : undefined}
    disabled={locked || isCurrent}
    className={`w-16 h-6 mt-1 text-xs font-medium rounded-md transition-opacity ${
      locked
        ? 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
        : isCurrent
        ? 'bg-indigo-600 text-white opacity-75 cursor-not-allowed'
        : 'bg-blue-500 text-white hover:bg-blue-600 opacity-100'
    }`}
  >
    {isCurrent ? 'Current' : 'Travel'}
  </button>
);

const WorldItem: React.FC<WorldItemProps> = ({ world, isCurrent, onTravel }) => {
  const { state } = useGame();

  // Safely access medals with defaults
  const medals = world.medals || { bronze: false, silver: false, gold: false };
  const hasBronze = medals.bronze;
  const hasSilver = medals.silver;
  const hasGold = medals.gold;

  // Safely access upgradeProgress with a default of 0
  const upgradeProgress = world.upgradeProgress ?? 0;

  // Determine which sprite to show
  const displaySprite = world.locked ? hiddenSprite : world.sprite;

  // Overlay size and position control for locked worlds
  const overlaySize = '182%';
  const overlayLeftOffset = '-1px';

  // Adjustable medal positions (tweak these values)
  const medalBottom = '-2px'; // Distance from bottom of sprite (negative moves down)
  const medalBottom2 = '-5px'; // Distance from bottom of sprite (negative moves down)
  const bronzeLeft = '5px';    // Bronze starts at left edge
  const silverLeft = '20px';   // Silver offset from bronze (w-6 = 24px + 4px spacing)
  const goldLeft = '37px';     // Gold offset from silver (another 24px + 4px spacing)

  return (
    <div
      className={`flex items-center p-3 rounded-lg border ${
        isCurrent ? 'border-indigo-500 bg-indigo-600/20' : 'border-slate-700'
      } ${world.locked ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700/20 transition-colors'}`}
    >
      {/* World Sprite with Medal PNGs Overlay and Travel Button */}
      <div className="relative w-16 flex-shrink-0 flex flex-col items-center">
        <img
          src={displaySprite}
          alt={world.locked ? 'Locked World' : world.name}
          className="w-16 h-16 object-contain"
        />
        {world.locked && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: '0',
              bottom: '0',
              left: overlayLeftOffset,
              right: '0',
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: overlaySize,
                height: overlaySize,
                background: 'radial-gradient(circle, rgba(0, 0, 0, 0.9) 50%, transparent 70%)',
              }}
            />
            <span
              className="absolute text-4xl text-gray-400 font-bold"
              style={{ top: '12px' }}
            >
              ?
            </span>
          </div>
        )}
        <TravelButton locked={world.locked} isCurrent={isCurrent} onClick={onTravel} />
      </div>

      {/* World Info */}
      <div className="flex-1 px-3">
        <h3 className="text-lg font-medium text-white">{world.name}</h3>
        <p className="text-sm text-slate-300">{world.description}</p>
        <p className="text-sm text-indigo-300">
          Progress: {upgradeProgress.toFixed(1)}%
        </p>
      </div>

      {/* Medals with Glowing Effect */}
      <div className="flex flex-col items-center gap-1 w-12">
        <Medal
          size={20}
          className={`${hasGold ? 'text-yellow-400' : 'text-gray-600'} ${
            hasGold ? 'drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]' : ''
          }`}
          strokeWidth={hasGold ? 2 : 1}
        />
        <Medal
          size={20}
          className={`${hasSilver ? 'text-gray-300' : 'text-gray-600'} ${
            hasSilver ? 'drop-shadow-[0_0_4px_rgba(192,192,192,0.8)]' : ''
          }`}
          strokeWidth={hasSilver ? 2 : 1}
        />
        <Medal
          size={20}
          className={`${hasBronze ? 'text-orange-400' : 'text-gray-600'} ${
            hasBronze ? 'drop-shadow-[0_0_4px_rgba(255,165,0,0.8)]' : ''
          }`}
          strokeWidth={hasBronze ? 2 : 1}
        />
      </div>
    </div>
  );
};

export default WorldItem;