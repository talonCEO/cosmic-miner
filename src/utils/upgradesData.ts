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

// Constants for progression balancing
const BASE_COST_MULTIPLIER = 1.08;        // Reduced from 1.15 to 1.08 for gentler late-game costs
const CLICK_VALUE_MULTIPLIER = 1.05;      // Unchanged (5% per level)
const PASSIVE_VALUE_MULTIPLIER = 1.10;    // Increased from 1.07 to 1.10 for better passive scaling

// Helper function to create element upgrades
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
  // Exponentially scale cost and benefits as we progress through elements
  const tierMultiplier = Math.pow(1.5, Math.floor((id - 1) / 5));
  const scaledBaseCost = baseCost * tierMultiplier;
  const scaledClickValue = clickValue * Math.sqrt(tierMultiplier);
  const scaledPassiveValue = passiveValue * tierMultiplier * 2; // Doubled passive income
  
  return {
    id: `element-${id}`,
    name: `${element} (${symbol})`,
    description,
    cost: scaledBaseCost,
    baseCost: scaledBaseCost,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: scaledClickValue,
    coinsPerSecondBonus: scaledPassiveValue,
    multiplierBonus: 0,
    icon,
    unlocked: id === 1, // Only the first element is unlocked by default
    unlocksAt: id > 1 ? { upgradeId: `element-${id-1}`, level: 1 } : undefined,
    category: UPGRADE_CATEGORIES.ELEMENT
  };
};

// Create Tap Power upgrade
const createTapPowerUpgrade = (): Upgrade => {
  return {
    id: 'tap-power-1',
    name: 'Tap Power',
    description: 'Improves active mining efficiency meaning you earn more while on the job. Each level increases your tap power by 5%.',
    cost: 100,
    baseCost: 100,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0.05,
    coinsPerSecondBonus: 0,
    multiplierBonus: 0,
    icon: 'hand',
    unlocked: true,
    category: UPGRADE_CATEGORIES.TAP
  };
};

// Initial upgrades list with 50 element-themed upgrades
export const upgradesList: Upgrade[] = [
  // Common elements (1-10)
  createElementUpgrade(1, 'Hydrogen', 'H', 10, 1, 0.4, 'The most abundant element in the universe', 'atom'),
  createElementUpgrade(2, 'Carbon', 'C', 50, 2, 0.8, 'The building block of all organic matter', 'atom'),
  createElementUpgrade(3, 'Oxygen', 'O', 250, 3, 1.6, 'Essential for combustion and respiration', 'flask-conical'),
  createElementUpgrade(4, 'Nitrogen', 'N', 1000, 4, 3, 'Makes up most of Earth\'s atmosphere', 'flask-conical'),
  createElementUpgrade(5, 'Silicon', 'Si', 5000, 5, 6, 'The foundation of modern electronics', 'cpu'),
  createElementUpgrade(6, 'Aluminum', 'Al', 20000, 8, 12, 'Lightweight and corrosion-resistant metal', 'layers'),
  createElementUpgrade(7, 'Iron', 'Fe', 50000, 12, 20, 'The most common element on Earth by mass', 'hammer'),
  createElementUpgrade(8, 'Copper', 'Cu', 200000, 18, 30, 'Excellent conductor of electricity and heat', 'bolt'),
  createElementUpgrade(9, 'Zinc', 'Zn', 500000, 25, 44, 'Essential for human health and industrial applications', 'flask-conical'),
  createElementUpgrade(10, 'Tin', 'Sn', 1000000, 35, 60, 'Used in alloys and protective coatings', 'layers'),
  
  // Intermediate elements (11-20)
  createElementUpgrade(11, 'Titanium', 'Ti', 3000000, 45, 80, 'Strong, lightweight, and corrosion-resistant', 'shield'),
  createElementUpgrade(12, 'Chromium', 'Cr', 10000000, 60, 110, 'Used in stainless steel and decorative plating', 'sparkles'),
  createElementUpgrade(13, 'Manganese', 'Mn', 30000000, 80, 140, 'Essential for steel production', 'hammer'),
  createElementUpgrade(14, 'Cobalt', 'Co', 100000000, 100, 180, 'Used in high-strength alloys and magnets', 'magnet'),
  createElementUpgrade(15, 'Nickel', 'Ni', 300000000, 130, 240, 'Used in batteries and corrosion-resistant alloys', 'battery'),
  createElementUpgrade(16, 'Molybdenum', 'Mo', 1000000000, 180, 320, 'Enhances steel\'s strength at high temperatures', 'flame'),
  createElementUpgrade(17, 'Silver', 'Ag', 5000000000, 240, 440, 'Highest electrical and thermal conductivity', 'sparkles'),
  createElementUpgrade(18, 'Tungsten', 'W', 15000000000, 320, 600, 'Has the highest melting point of all elements', 'flame'),
  createElementUpgrade(19, 'Lead', 'Pb', 50000000000, 450, 800, 'Dense, malleable, and resistant to corrosion', 'shield'),
  createElementUpgrade(20, 'Uranium', 'U', 200000000000, 650, 1200, 'Used in nuclear power generation', 'radiation'),
  
  // Valuable elements (21-30)
  createElementUpgrade(21, 'Lithium', 'Li', 800000000000, 900, 1600, 'Essential for modern batteries', 'battery'),
  createElementUpgrade(22, 'Neodymium', 'Nd', 3000000000000, 1200, 2000, 'Used in powerful permanent magnets', 'magnet'),
  createElementUpgrade(23, 'Germanium', 'Ge', 10000000000000, 1600, 2800, 'Used in fiber optics and infrared optics', 'eye'),
  createElementUpgrade(24, 'Gallium', 'Ga', 40000000000000, 2200, 4000, 'Used in LEDs and solar panels', 'sun'),
  createElementUpgrade(25, 'Indium', 'In', 150000000000000, 3000, 5600, 'Used in touchscreens and flat-panel displays', 'monitor'),
  createElementUpgrade(26, 'Tellurium', 'Te', 500000000000000, 4000, 7600, 'Used in solar panels and thermoelectric devices', 'sun'),
  createElementUpgrade(27, 'Rare Earth Mix', 'RE', 2000000000000000, 5500, 10000, 'A mix of valuable rare earth elements', 'gem'),
  createElementUpgrade(28, 'Ruthenium', 'Ru', 8000000000000000, 7500, 14000, 'Used in wear-resistant electrical contacts', 'bolt'),
  createElementUpgrade(29, 'Rhodium', 'Rh', 30000000000000000, 10000, 18000, 'Used in catalytic converters', 'truck'),
  createElementUpgrade(30, 'Palladium', 'Pd', 100000000000000000, 14000, 24000, 'Crucial for catalytic converters and electronics', 'truck'),
  
  // Precious elements (31-40)
  createElementUpgrade(31, 'Iridium', 'Ir', 400000000000000000, 20000, 36000, 'The most corrosion-resistant metal', 'shield'),
  createElementUpgrade(32, 'Gold', 'Au', 1500000000000000000, 28000, 50000, 'Prized for its beauty and conductivity', 'gem'),
  createElementUpgrade(33, 'Platinum', 'Pt', 5000000000000000000, 40000, 70000, 'Precious metal used in catalysts and jewelry', 'gem'),
  createElementUpgrade(34, 'Rhenium', 'Re', 20000000000000000000, 55000, 100000, 'One of the rarest elements in Earth\'s crust', 'pickaxe'),
  createElementUpgrade(35, 'Osmium', 'Os', 75000000000000000000, 75000, 140000, 'The densest naturally occurring element', 'globe'),
  createElementUpgrade(36, 'Scandium', 'Sc', 250000000000000000000, 100000, 180000, 'Used in aerospace components and sports equipment', 'plane'),
  createElementUpgrade(37, 'Yttrium', 'Y', 1000000000000000000000, 140000, 250000, 'Used in LED lights and cancer treatments', 'lightbulb'),
  createElementUpgrade(38, 'Europium', 'Eu', 3500000000000000000000, 200000, 360000, 'Used in anti-counterfeiting marks on banknotes', 'banknote'),
  createElementUpgrade(39, 'Terbium', 'Tb', 10000000000000000000000, 280000, 500000, 'Used in solid-state devices and fuel cells', 'cpu'),
  createElementUpgrade(40, 'Dysprosium', 'Dy', 35000000000000000000000, 400000, 700000, 'Used in nuclear reactors and data storage devices', 'database'),
  
  // Ultra-rare elements (41-50)
  createElementUpgrade(41, 'Promethium', 'Pm', 120000000000000000000000, 550000, 1000000, 'The only naturally radioactive lanthanide', 'radiation'),
  createElementUpgrade(42, 'Gadolinium', 'Gd', 400000000000000000000000, 750000, 1400000, 'Has unique magnetic properties', 'magnet'),
  createElementUpgrade(43, 'Lutetium', 'Lu', 1500000000000000000000000, 1000000, 1800000, 'Used in petroleum refining and positron emission tomography', 'flask-conical'),
  createElementUpgrade(44, 'Thulium', 'Tm', 5000000000000000000000000, 1400000, 2400000, 'The least abundant naturally occurring lanthanide', 'pickaxe'),
  createElementUpgrade(45, 'Hafnium', 'Hf', 15000000000000000000000000, 2000000, 3600000, 'Used in nuclear control rods', 'radiation'),
  createElementUpgrade(46, 'Tantalum', 'Ta', 50000000000000000000000000, 3000000, 5000000, 'Used in electronic components', 'cpu'),
  createElementUpgrade(47, 'Berkelium', 'Bk', 150000000000000000000000000, 4500000, 8000000, 'Synthetic element with no stable isotopes', 'test-tube'),
  createElementUpgrade(48, 'Californium', 'Cf', 500000000000000000000000000, 7000000, 12000000, 'Used in neutron moisture gauges', 'test-tube'),
  createElementUpgrade(49, 'Antimatter', 'AM', 1500000000000000000000000000, 12000000, 20000000, 'The ultimate power source', 'atom'),
  createElementUpgrade(50, 'Exotic Matter', 'XM', 5000000000000000000000000000, 20000000, 36000000, 'Theoretical matter with unique properties', 'sparkles'),
  
  // Add Tap Power as the last upgrade
  createTapPowerUpgrade()
];
