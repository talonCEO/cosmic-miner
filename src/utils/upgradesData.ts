
import { Upgrade } from '@/context/GameContext';

// Categories
export const UPGRADE_CATEGORIES = {
  ELEMENT: 'element'
};

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
): Upgrade => ({
  id: `element-${id}`,
  name: `${element} (${symbol})`,
  description,
  cost: baseCost,
  baseCost,
  level: 0,
  maxLevel: 1000, // Changed from 10 to 1000
  coinsPerClickBonus: clickValue,
  coinsPerSecondBonus: passiveValue * 2.5, // Reduced by 75% (was * 10)
  multiplierBonus: 0,
  icon,
  unlocked: id === 1, // Only the first element is unlocked by default
  unlocksAt: id > 1 ? { upgradeId: `element-${id-1}`, level: 1 } : undefined,
  category: UPGRADE_CATEGORIES.ELEMENT
});

// Initial upgrades list with 50 element-themed upgrades in order of value
export const upgradesList: Upgrade[] = [
  // Common elements (1-10)
  createElementUpgrade(1, 'Hydrogen', 'H', 10, 1, 0.1, 'The most abundant element in the universe', 'atom'),
  createElementUpgrade(2, 'Carbon', 'C', 50, 2, 0.2, 'The building block of all organic matter', 'atom'),
  createElementUpgrade(3, 'Oxygen', 'O', 100, 3, 0.3, 'Essential for combustion and respiration', 'flask-conical'),
  createElementUpgrade(4, 'Nitrogen', 'N', 250, 4, 0.5, 'Makes up most of Earth\'s atmosphere', 'flask-conical'),
  createElementUpgrade(5, 'Silicon', 'Si', 500, 5, 1, 'The foundation of modern electronics', 'cpu'),
  createElementUpgrade(6, 'Aluminum', 'Al', 1000, 10, 2, 'Lightweight and corrosion-resistant metal', 'layers'),
  createElementUpgrade(7, 'Iron', 'Fe', 2500, 15, 3, 'The most common element on Earth by mass', 'hammer'),
  createElementUpgrade(8, 'Copper', 'Cu', 5000, 20, 5, 'Excellent conductor of electricity and heat', 'bolt'),
  createElementUpgrade(9, 'Zinc', 'Zn', 10000, 30, 8, 'Essential for human health and industrial applications', 'flask-conical'),
  createElementUpgrade(10, 'Tin', 'Sn', 15000, 50, 10, 'Used in alloys and protective coatings', 'layers'),
  
  // Intermediate elements (11-20)
  createElementUpgrade(11, 'Titanium', 'Ti', 25000, 75, 15, 'Strong, lightweight, and corrosion-resistant', 'shield'),
  createElementUpgrade(12, 'Chromium', 'Cr', 40000, 100, 20, 'Used in stainless steel and decorative plating', 'sparkles'),
  createElementUpgrade(13, 'Manganese', 'Mn', 75000, 150, 30, 'Essential for steel production', 'hammer'),
  createElementUpgrade(14, 'Cobalt', 'Co', 100000, 200, 40, 'Used in high-strength alloys and magnets', 'magnet'),
  createElementUpgrade(15, 'Nickel', 'Ni', 150000, 250, 50, 'Used in batteries and corrosion-resistant alloys', 'battery'),
  createElementUpgrade(16, 'Molybdenum', 'Mo', 200000, 300, 75, 'Enhances steel\'s strength at high temperatures', 'flame'),
  createElementUpgrade(17, 'Silver', 'Ag', 350000, 400, 100, 'Highest electrical and thermal conductivity', 'sparkles'),
  createElementUpgrade(18, 'Tungsten', 'W', 500000, 500, 125, 'Has the highest melting point of all elements', 'flame'),
  createElementUpgrade(19, 'Lead', 'Pb', 750000, 600, 150, 'Dense, malleable, and resistant to corrosion', 'shield'),
  createElementUpgrade(20, 'Uranium', 'U', 1000000, 800, 200, 'Used in nuclear power generation', 'radiation'),
  
  // Valuable elements (21-30)
  createElementUpgrade(21, 'Lithium', 'Li', 1500000, 1000, 250, 'Essential for modern batteries', 'battery'),
  createElementUpgrade(22, 'Neodymium', 'Nd', 2000000, 1250, 300, 'Used in powerful permanent magnets', 'magnet'),
  createElementUpgrade(23, 'Germanium', 'Ge', 2500000, 1500, 350, 'Used in fiber optics and infrared optics', 'eye'),
  createElementUpgrade(24, 'Gallium', 'Ga', 3000000, 1750, 400, 'Used in LEDs and solar panels', 'sun'),
  createElementUpgrade(25, 'Indium', 'In', 4000000, 2000, 500, 'Used in touchscreens and flat-panel displays', 'monitor'),
  createElementUpgrade(26, 'Tellurium', 'Te', 5000000, 2500, 600, 'Used in solar panels and thermoelectric devices', 'sun'),
  createElementUpgrade(27, 'Rare Earth Mix', 'RE', 7500000, 3000, 750, 'A mix of valuable rare earth elements', 'gem'),
  createElementUpgrade(28, 'Ruthenium', 'Ru', 10000000, 4000, 1000, 'Used in wear-resistant electrical contacts', 'bolt'),
  createElementUpgrade(29, 'Rhodium', 'Rh', 15000000, 5000, 1500, 'Used in catalytic converters', 'truck'),
  createElementUpgrade(30, 'Palladium', 'Pd', 20000000, 7500, 2000, 'Crucial for catalytic converters and electronics', 'truck'),
  
  // Precious elements (31-40)
  createElementUpgrade(31, 'Iridium', 'Ir', 30000000, 10000, 2500, 'The most corrosion-resistant metal', 'shield'),
  createElementUpgrade(32, 'Gold', 'Au', 50000000, 15000, 3000, 'Prized for its beauty and conductivity', 'gem'),
  createElementUpgrade(33, 'Platinum', 'Pt', 75000000, 20000, 4000, 'Precious metal used in catalysts and jewelry', 'gem'),
  createElementUpgrade(34, 'Rhenium', 'Re', 100000000, 25000, 5000, 'One of the rarest elements in Earth\'s crust', 'pickaxe'),
  createElementUpgrade(35, 'Osmium', 'Os', 150000000, 30000, 7500, 'The densest naturally occurring element', 'globe'),
  createElementUpgrade(36, 'Scandium', 'Sc', 200000000, 40000, 10000, 'Used in aerospace components and sports equipment', 'plane'),
  createElementUpgrade(37, 'Yttrium', 'Y', 300000000, 50000, 15000, 'Used in LED lights and cancer treatments', 'lightbulb'),
  createElementUpgrade(38, 'Europium', 'Eu', 500000000, 75000, 20000, 'Used in anti-counterfeiting marks on banknotes', 'banknote'),
  createElementUpgrade(39, 'Terbium', 'Tb', 750000000, 100000, 25000, 'Used in solid-state devices and fuel cells', 'cpu'),
  createElementUpgrade(40, 'Dysprosium', 'Dy', 1000000000, 150000, 30000, 'Used in nuclear reactors and data storage devices', 'database'),
  
  // Ultra-rare elements (41-50)
  createElementUpgrade(41, 'Promethium', 'Pm', 2000000000, 200000, 50000, 'The only naturally radioactive lanthanide', 'radiation'),
  createElementUpgrade(42, 'Gadolinium', 'Gd', 3000000000, 300000, 75000, 'Has unique magnetic properties', 'magnet'),
  createElementUpgrade(43, 'Lutetium', 'Lu', 5000000000, 500000, 100000, 'Used in petroleum refining and positron emission tomography', 'flask-conical'),
  createElementUpgrade(44, 'Thulium', 'Tm', 7500000000, 750000, 150000, 'The least abundant naturally occurring lanthanide', 'pickaxe'),
  createElementUpgrade(45, 'Hafnium', 'Hf', 10000000000, 1000000, 200000, 'Used in nuclear control rods', 'radiation'),
  createElementUpgrade(46, 'Tantalum', 'Ta', 25000000000, 2000000, 500000, 'Used in electronic components', 'cpu'),
  createElementUpgrade(47, 'Berkelium', 'Bk', 50000000000, 5000000, 1000000, 'Synthetic element with no stable isotopes', 'test-tube'),
  createElementUpgrade(48, 'Californium', 'Cf', 100000000000, 10000000, 2000000, 'Used in neutron moisture gauges', 'test-tube'),
  createElementUpgrade(49, 'Antimatter', 'AM', 500000000000, 50000000, 10000000, 'The ultimate power source', 'atom'),
  createElementUpgrade(50, 'Exotic Matter', 'XM', 1000000000000, 100000000, 20000000, 'Theoretical matter with unique properties', 'sparkles')
];
