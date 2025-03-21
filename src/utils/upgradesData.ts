
import { Upgrade } from "./types";

// Updated cost and income scaling for better late-game balance
const calculateUpgradeCost = (basePrice: number, level: number): number => {
  // Slower exponential growth for costs at higher levels
  if (level < 25) {
    return Math.floor(basePrice * Math.pow(1.07, level));
  } else if (level < 100) {
    return Math.floor(basePrice * Math.pow(1.06, level));
  } else if (level < 500) {
    return Math.floor(basePrice * Math.pow(1.05, level));
  } else {
    return Math.floor(basePrice * Math.pow(1.04, level));
  }
};

// Enhanced income scaling for better passive income at higher levels
const calculateIncomePerSecond = (baseIncome: number, level: number): number => {
  if (level < 50) {
    return baseIncome * level;
  } else if (level < 200) {
    // Boost after level 50
    return baseIncome * level * 1.2;
  } else if (level < 500) {
    // Bigger boost after level 200
    return baseIncome * level * 1.5;
  } else {
    // Substantial boost after level 500
    return baseIncome * level * 2;
  }
};

export const createUpgradesData = (): Upgrade[] => {
  return [
    {
      id: 1,
      name: "Asteroid Drill",
      description: "Basic mining equipment for space minerals",
      image: "/src/assets/images/icons/asteroid-drill.png",
      basePrice: 15,
      baseMiningRate: 0.2,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 2,
      name: "Laser Extraction",
      description: "Uses laser tech to extract minerals efficiently",
      image: "/src/assets/images/icons/laser-extraction.png",
      basePrice: 100,
      baseMiningRate: 1,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 3,
      name: "Plasma Excavator",
      description: "Uses plasma technology to excavate cosmic materials",
      image: "/src/assets/images/icons/plasma-excavator.png",
      basePrice: 1100,
      baseMiningRate: 8,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 4,
      name: "Nano-Bot Swarm",
      description: "Microscopic bots that mine collectively",
      image: "/src/assets/images/icons/nano-bot-swarm.png",
      basePrice: 12000,
      baseMiningRate: 47,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 5,
      name: "Quantum Vibration",
      description: "Utilizes quantum physics to extract cosmic elements",
      image: "/src/assets/images/icons/quantum-vibration.png",
      basePrice: 130000,
      baseMiningRate: 260,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 6,
      name: "Galactic Scanner",
      description: "Scans the galaxy for valuable cosmic resources",
      image: "/src/assets/images/icons/galactic-scanner.png",
      basePrice: 1400000,
      baseMiningRate: 1400,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 7,
      name: "Interstellar Navigation",
      description: "Navigate through interstellar space for rare minerals",
      image: "/src/assets/images/icons/interstellar-nav.png",
      basePrice: 20000000,
      baseMiningRate: 7800,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 8,
      name: "Graviton Shield",
      description: "Shields to mine in extreme gravitational environments",
      image: "/src/assets/images/icons/graviton-shield.png",
      basePrice: 330000000,
      baseMiningRate: 44000,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 9,
      name: "Neural Mining AI",
      description: "AI that optimizes the mining process",
      image: "/src/assets/images/icons/neural-mining.png",
      basePrice: 5100000000,
      baseMiningRate: 260000,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 10,
      name: "Quantum Tunneling",
      description: "Creates quantum tunnels to access deep space minerals",
      image: "/src/assets/images/icons/quantum-tunnel.png",
      basePrice: 75000000000,
      baseMiningRate: 1600000,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 11,
      name: "Supernova Core",
      description: "Harnesses the power of supernovas for cosmic mining",
      image: "/src/assets/images/icons/supernova-core.png",
      basePrice: 1000000000000,
      baseMiningRate: 10000000,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
    {
      id: 12,
      name: "Cosmic Singularity",
      description: "Utilizes cosmic singularities for ultimate mining power",
      image: "/src/assets/images/icons/cosmic-singularity.png",
      basePrice: 14000000000000,
      baseMiningRate: 65000000,
      calculateUpgradeCost,
      calculateIncomePerSecond,
      level: 0,
      autoBuy: false,
    },
  ];
};
