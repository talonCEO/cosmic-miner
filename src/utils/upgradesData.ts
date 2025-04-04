import { Upgrade } from '@/context/GameContext';

// Categories
export const UPGRADE_CATEGORIES = {
  ELEMENT: 'element',
  TAP: 'tap'
};

/**
 * Game Balance Philosophy:
 * 
 * 1. Early Progress: Fast (~5-10 minutes for first upgrades)
 * 2. Mid Game: Moderate (~hours to days for mid-tier)
 * 3. Late Game: 20-25 hours total to max all upgrades
 * 4. Smoother Scaling: Reduced cost growth and higher passive income late-game
 * 5. Prestige Acceleration: Unchanged (handled elsewhere)
 */

// upgradesData.ts
// Constants for progression balancing
const BASE_COST_MULTIPLIER = 1.05;        // Reduced from 1.08 to 1.05
const CLICK_VALUE_MULTIPLIER = 1.05;      // Unchanged
const PASSIVE_VALUE_MULTIPLIER = 1.25;     // Increased from 1.10 to 1.15

const GLOBAL_PRODUCTION_SCALING = 1.02;   // Adjusted to 1% increase per 100 total levels

const createElementUpgrade = (
  id: number,
  element: string,
  symbol: string,
  baseCost: number,
  clickValue: number,
  passiveValue: number,
  description: string,
  icon: string
): Upgrade => {
  const tierMultiplier = Math.pow(1.25, Math.floor((id - 1) / 5));
  const scaledBaseCost = baseCost * tierMultiplier;
  const scaledClickValue = clickValue * Math.sqrt(tierMultiplier);
  const scaledPassiveValue = passiveValue * tierMultiplier * 5; 

  return {
    id: `element-${id}`,
    name: `${element} (${symbol})`,
    description,
    cost: scaledBaseCost,
    baseCost: scaledBaseCost,
    level: 0,
    maxLevel: 500,  // Changed from 1000 to 100
    coinsPerClickBonus: scaledClickValue,
    coinsPerSecondBonus: scaledPassiveValue,
    multiplierBonus: 0,
    icon,
    unlocked: id === 1,
    unlocksAt: id > 1 ? { upgradeId: `element-${id-1}`, level: 1 } : undefined,
    category: UPGRADE_CATEGORIES.ELEMENT
  };
};

// New function to calculate global multiplier
export const calculateGlobalProductionMultiplier = (totalLevels: number): number => {
  return Math.pow(GLOBAL_PRODUCTION_SCALING, totalLevels / 50); // Scales with every 100 levels
};

// Create Tap Power upgrade
const createTapPowerUpgrade = (): Upgrade => {
  return {
    id: 'tap-power-1',
    name: 'Tap Power',
    description: 'Improves active mining efficiency meaning you earn more while on the job. Each level increases your tap power by 5%.',
    cost: 50,
    baseCost: 100,
    level: 0,
    maxLevel: 500,  // Changed from 1000 to 100
    coinsPerClickBonus: 0.1,
    coinsPerSecondBonus: 0,
    multiplierBonus: 0,
    icon: 'hand',
    unlocked: true,
    category: UPGRADE_CATEGORIES.TAP
  };
};

export const upgradesList: Upgrade[] = [
  createElementUpgrade(1, 'Hydrogen', 'H', 10, 1, 0.2, 'The most abundant element in the universe', 'cloud'),
  createElementUpgrade(2, 'Carbon', 'C', 50, 2, 0.4, 'The building block of all organic matter', 'diamond'),
  createElementUpgrade(3, 'Oxygen', 'O', 250, 3, 0.8, 'Essential for combustion and respiration', 'wind'),
  createElementUpgrade(4, 'Nitrogen', 'N', 1000, 4, 1.5, 'Makes up most of Earth\'s atmosphere', 'cloud-rain'),
  createElementUpgrade(5, 'Silicon', 'Si', 5000, 5, 3, 'The foundation of modern electronics', 'cpu'),
  createElementUpgrade(6, 'Aluminum', 'Al', 20000, 8, 6, 'Lightweight and corrosion-resistant metal', 'box'),
  createElementUpgrade(7, 'Iron', 'Fe', 50000, 12, 10, 'The most common element on Earth by mass', 'anvil'),
  createElementUpgrade(8, 'Copper', 'Cu', 200000, 18, 15, 'Excellent conductor of electricity and heat', 'zap'),
  createElementUpgrade(9, 'Zinc', 'Zn', 500000, 25, 22, 'Essential for human health and industrial applications', 'droplet'),
  createElementUpgrade(10, 'Tin', 'Sn', 1000000, 35, 30, 'Used in alloys and protective coatings', 'package'),
  
  createElementUpgrade(11, 'Titanium', 'Ti', 3000000, 45, 40, 'Strong, lightweight, and corrosion-resistant', 'shield-check'),
  createElementUpgrade(12, 'Chromium', 'Cr', 10000000, 60, 55, 'Used in stainless steel and decorative plating', 'paintbrush'),
  createElementUpgrade(13, 'Manganese', 'Mn', 30000000, 80, 70, 'Essential for steel production', 'wrench'),
  createElementUpgrade(14, 'Cobalt', 'Co', 100000000, 100, 90, 'Used in high-strength alloys and magnets', 'magnet'),
  createElementUpgrade(15, 'Nickel', 'Ni', 300000000, 130, 120, 'Used in batteries and corrosion-resistant alloys', 'battery-charging'),
  createElementUpgrade(16, 'Molybdenum', 'Mo', 1000000000, 180, 160, 'Enhances steel\'s strength at high temperatures', 'thermometer'),
  createElementUpgrade(17, 'Silver', 'Ag', 5000000000, 240, 220, 'Highest electrical and thermal conductivity', 'star'),
  createElementUpgrade(18, 'Tungsten', 'W', 15000000000, 320, 300, 'Has the highest melting point of all elements', 'flame'),
  createElementUpgrade(19, 'Lead', 'Pb', 50000000000, 450, 400, 'Dense, malleable, and resistant to corrosion', 'weight'),
  createElementUpgrade(20, 'Uranium', 'U', 200000000000, 650, 600, 'Used in nuclear power generation', 'radiation'),
  
  createElementUpgrade(21, 'Lithium', 'Li', 800000000000, 900, 800, 'Essential for modern batteries', 'battery'),
  createElementUpgrade(22, 'Neodymium', 'Nd', 3000000000000, 1200, 1000, 'Used in powerful permanent magnets', 'compass'),
  createElementUpgrade(23, 'Germanium', 'Ge', 10000000000000, 1600, 1400, 'Used in fiber optics and infrared optics', 'eye'),
  createElementUpgrade(24, 'Gallium', 'Ga', 40000000000000, 2200, 2000, 'Used in LEDs and solar panels', 'sun'),
  createElementUpgrade(25, 'Indium', 'In', 150000000000000, 3000, 2800, 'Used in touchscreens and flat-panel displays', 'monitor'),
  createElementUpgrade(26, 'Tellurium', 'Te', 500000000000000, 4000, 3800, 'Used in solar panels and thermoelectric devices', 'zap-off'),
  createElementUpgrade(27, 'Rare Earth Mix', 'RE', 2000000000000000, 5500, 5000, 'A mix of valuable rare earth elements', 'gem'),
  createElementUpgrade(28, 'Ruthenium', 'Ru', 8000000000000000, 7500, 7000, 'Used in wear-resistant electrical contacts', 'plug'),
  createElementUpgrade(29, 'Rhodium', 'Rh', 30000000000000000, 10000, 9000, 'Used in catalytic converters', 'car'),
  createElementUpgrade(30, 'Palladium', 'Pd', 100000000000000000, 14000, 12000, 'Crucial for catalytic converters and electronics', 'truck'),
  
  createElementUpgrade(31, 'Iridium', 'Ir', 400000000000000000, 20000, 18000, 'The most corrosion-resistant metal', 'shield'),
  createElementUpgrade(32, 'Gold', 'Au', 1500000000000000000, 28000, 25000, 'Prized for its beauty and conductivity', 'crown'),
  createElementUpgrade(33, 'Platinum', 'Pt', 5000000000000000000, 40000, 35000, 'Precious metal used in catalysts and jewelry', 'award'),
  createElementUpgrade(34, 'Rhenium', 'Re', 20000000000000000000, 55000, 50000, 'One of the rarest elements in Earth\'s crust', 'pickaxe'),
  createElementUpgrade(35, 'Osmium', 'Os', 75000000000000000000, 75000, 70000, 'The densest naturally occurring element', 'anchor'),
  createElementUpgrade(36, 'Scandium', 'Sc', 250000000000000000000, 100000, 90000, 'Used in aerospace components and sports equipment', 'plane'),
  createElementUpgrade(37, 'Yttrium', 'Y', 1000000000000000000000, 140000, 125000, 'Used in LED lights and cancer treatments', 'lightbulb'),
  createElementUpgrade(38, 'Europium', 'Eu', 3500000000000000000000, 200000, 180000, 'Used in anti-counterfeiting marks on banknotes', 'banknote'),
  createElementUpgrade(39, 'Terbium', 'Tb', 10000000000000000000000, 280000, 250000, 'Used in solid-state devices and fuel cells', 'server'),
  createElementUpgrade(40, 'Dysprosium', 'Dy', 35000000000000000000000, 400000, 350000, 'Used in nuclear reactors and data storage devices', 'database'),
  
  createElementUpgrade(41, 'Promethium', 'Pm', 120000000000000000000000, 550000, 500000, 'The only naturally radioactive lanthanide', 'alert-triangle'),
  createElementUpgrade(42, 'Gadolinium', 'Gd', 400000000000000000000000, 750000, 700000, 'Has unique magnetic properties', 'activity'),
  createElementUpgrade(43, 'Lutetium', 'Lu', 1500000000000000000000000, 1000000, 900000, 'Used in petroleum refining and positron emission tomography', 'beaker'),
  createElementUpgrade(44, 'Thulium', 'Tm', 5000000000000000000000000, 1400000, 1200000, 'The least abundant naturally occurring lanthanide', 'search'),
  createElementUpgrade(45, 'Hafnium', 'Hf', 15000000000000000000000000, 2000000, 1800000, 'Used in nuclear control rods', 'gauge'),
  createElementUpgrade(46, 'Tantalum', 'Ta', 50000000000000000000000000, 3000000, 2500000, 'Used in electronic components', 'hard-drive'),
  createElementUpgrade(47, 'Berkelium', 'Bk', 150000000000000000000000000, 4500000, 4000000, 'Synthetic element with no stable isotopes', 'test-tube'),
  createElementUpgrade(48, 'Californium', 'Cf', 500000000000000000000000000, 7000000, 6000000, 'Used in neutron moisture gauges', 'droplets'),
  createElementUpgrade(49, 'Antimatter', 'AM', 1500000000000000000000000000, 12000000, 10000000, 'The ultimate power source', 'atom'),
  createElementUpgrade(50, 'Exotic Matter', 'XM', 5000000000000000000000000000, 20000000, 18000000, 'Theoretical matter with unique properties', 'sparkles'),
  
  createTapPowerUpgrade(),
];