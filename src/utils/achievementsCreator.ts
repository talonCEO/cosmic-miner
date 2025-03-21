import { Achievement, GameState } from '@/context/GameContext';
import GemIcon from '@/assets/images/icons/gems1.png';
import PortraitIcon3 from '@/assets/images/portraits/3.png'; // astral_navigator
import PortraitIcon4 from '@/assets/images/portraits/4.png'; // stellar_seeker
import PortraitIcon5 from '@/assets/images/portraits/5.png'; // eclipse_warden
import PortraitIcon6 from '@/assets/images/portraits/normalMax.png'; // galactic_guardian
import PortraitIcon7 from '@/assets/images/portraits/specialMax.png'; // singularity_lord
import PortraitIcon8 from '@/assets/images/portraits/uniqueNormal.png'; // cosmic_overlord
import PortraitIcon9 from '@/assets/images/portraits/love.png'; // love (Stellar Supporter)

export const createAchievements = (): Achievement[] => {
  return [
    // Clicking Achievements (Early to Mid-Game)
    { id: 'clicks-1', name: 'Mining Apprentice', description: 'Tap 100 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 100, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'clicks-2', name: 'Mining Enthusiast', description: 'Tap 1,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 1000, rewards: { type: 'gems', value: 10, image: GemIcon } }, // Changed from nebula_voyager
    { id: 'clicks-3', name: 'Mining Expert', description: 'Tap 10,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 10000, rewards: { type: 'portrait', value: 'astral_navigator', image: PortraitIcon3 } }, // Easier: 3.png
    { id: 'clicks-4', name: 'Mining Master', description: 'Tap 100,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 100000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'clicks-5', name: 'Mining Legend', description: 'Tap 1,000,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 1000000, rewards: { type: 'title', value: 'quantum_miner', image: 'Quantum Miner' } }, // Rare
    { id: 'clicks-6', name: 'Tap Titan', description: 'Tap 10,000,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 10000000, rewards: { type: 'portrait', value: 'galactic_guardian', image: PortraitIcon6 } }, // Epic: normalMax.png

    // Income Achievements (Early to Late-Game)
    { id: 'income-1', name: 'First Profit', description: 'Earn 1,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'income-2', name: 'Rising Business', description: 'Earn 1,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'income-3', name: 'Mining Corporation', description: 'Earn 1,000,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000000, rewards: { type: 'title', value: 'cosmic_explorer', image: 'Cosmic Explorer' } }, // Uncommon
    { id: 'income-4', name: 'Galactic Enterprise', description: 'Earn 1,000,000,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000000000, rewards: { type: 'title', value: 'galactic_pioneer', image: 'Galactic Pioneer' } }, // Rare
    { id: 'income-5', name: 'Universal Conglomerate', description: 'Earn 1,000,000,000,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000000000000, rewards: { type: 'portrait', value: 'cosmic_overlord', image: PortraitIcon8 } }, // Legendary: uniqueNormal.png
    { id: 'income-6', name: 'Cosmic Tycoon', description: 'Earn 1 quintillion coins (1e18)', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1e18, rewards: { type: 'portrait', value: 'singularity_lord', image: PortraitIcon7 } }, // Epic: specialMax.png

    // Upgrade Achievements (Mid-Game)
    { id: 'upgrades-1', name: 'Building Elements', description: 'Purchase 10 element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length >= 10, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'upgrades-2', name: 'Elemental Explorer', description: 'Purchase 25 element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length >= 25, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'upgrades-3', name: 'Elemental Mastery', description: 'Purchase all element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length === state.upgrades.filter(u => u.category === 'element').length && state.upgrades.filter(u => u.category === 'element').length > 0, rewards: { type: 'title', value: 'asteroid_hunter', image: 'Asteroid Hunter' } }, // Uncommon
    { id: 'level-1', name: 'Enhancement Beginner', description: 'Get any upgrade to level 50', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 50), rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'level-2', name: 'Enhancement Pro', description: 'Get any upgrade to level 100', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 100), rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'level-3', name: 'Enhancement Master', description: 'Get any upgrade to level 500', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 500), rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'upgrades-4', name: 'Upgrade Overlord', description: 'Get 5 upgrades to level 1000', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.level >= 1000).length >= 5, rewards: { type: 'portrait', value: 'eclipse_warden', image: PortraitIcon5 } }, // Rare: 5.png
    { id: 'level-4', name: 'Upgrade Titan', description: 'Get 10 upgrades to level 500', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.level >= 500).length >= 10, rewards: { type: 'title', value: 'stellar_commander', image: 'Stellar Commander' } }, // Epic

    // Prestige Achievements (Mid to Late-Game)
    { id: 'prestige-1', name: 'Fresh Start', description: 'Prestige for the first time', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 1, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'prestige-2', name: 'Cycle of Rebirth', description: 'Prestige 5 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 5, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'prestige-3', name: 'Perpetual Renewal', description: 'Prestige 10 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 10, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'prestige-4', name: 'Master of Reincarnation', description: 'Prestige 25 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 25, rewards: { type: 'title', value: 'nebula_master', image: 'Nebula Master' } }, // Epic
    { id: 'prestige-5', name: 'Eternal Cycle', description: 'Prestige 50 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 50, rewards: { type: 'portrait', value: 'stellar_seeker', image: PortraitIcon4 } }, // Rare: 4.png

    // Special Achievements (Mid-Game)
    { id: 'passive-1', name: 'Automation Beginner', description: 'Reach 1,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'passive-2', name: 'Automation Expert', description: 'Reach 1,000,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'passive-3', name: 'Automation Master', description: 'Reach 1,000,000,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'passive-4', name: 'Passive Emperor', description: 'Reach 1 trillion coins per second (1e12)', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1e12, rewards: { type: 'title', value: 'essence_collector', image: 'Essence Collector' } }, // Rare
    { id: 'passive-5', name: 'Idle Sovereign', description: 'Reach 1 quadrillion coins per second (1e15)', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1e15, rewards: { type: 'gems', value: 25, image: GemIcon } },
    { id: 'collection-1', name: 'Artifact Collector', description: 'Own 5 artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= 5, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'collection-2', name: 'Rare Collector', description: 'Own all artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= state.artifacts.length, rewards: { type: 'title', value: 'space_rookie', image: 'Space Rookie' } }, // Common
    { id: 'abilities-1', name: 'Tech Pioneer', description: 'Unlock 5 abilities', unlocked: false, checkCondition: (state: GameState) => state.abilities.filter(a => a.unlocked).length >= 5, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'abilities-2', name: 'Tech Visionary', description: 'Unlock all abilities', unlocked: false, checkCondition: (state: GameState) => state.abilities.filter(a => a.unlocked).length === state.abilities.length && state.abilities.length > 0, rewards: { type: 'title', value: 'void_emperor', image: 'Void Emperor' } }, // Legendary
    { id: 'abilities-3', name: 'Tech Savant', description: 'Unlock 10 abilities', unlocked: false, checkCondition: (state: GameState) => state.abilities.filter(a => a.unlocked).length >= 10, rewards: { type: 'gems', value: 15, image: GemIcon } },

    // New Achievements (Mostly Late-Game)
    { id: 'essence-1', name: 'Essence Hoarder', description: 'Collect 10,000 essence', unlocked: false, checkCondition: (state: GameState) => state.essence >= 10000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'essence-2', name: 'Essence Lord', description: 'Collect 1,000,000 essence', unlocked: false, checkCondition: (state: GameState) => state.essence >= 1000000, rewards: { type: 'title', value: 'cosmic_deity', image: 'Cosmic Deity' } }, // Legendary
    { id: 'managers-1', name: 'Crew Leader', description: 'Own 10 managers', unlocked: false, checkCondition: (state: GameState) => state.ownedManagers.length >= 10, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'managers-2', name: 'Galactic Overseer', description: 'Own all managers', unlocked: false, checkCondition: (state: GameState) => state.ownedManagers.length >= state.managers.length, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'artifacts-1', name: 'Relic Hunter', description: 'Own 10 artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= 10, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'artifacts-2', name: 'Cosmic Archivist', description: 'Own 20 artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= 20, rewards: { type: 'gems', value: 25, image: GemIcon } },
    { id: 'skillpoints-1', name: 'Skill Accumulator', description: 'Earn 100 skill points', unlocked: false, checkCondition: (state: GameState) => state.skillPoints >= 100, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'inventory-1', name: 'Hoarder', description: 'Fill your inventory to 75% capacity', unlocked: false, checkCondition: (state: GameState) => state.inventory.reduce((total, item) => total + (item.stackable ? 1 : item.quantity), 0) >= state.inventoryCapacity * 0.75, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'boosts-1', name: 'Boost Addict', description: 'Activate 50 boosts', unlocked: false, checkCondition: (state: GameState) => Object.values(state.boosts).reduce((total, b) => total + (b.purchased || 0), 0) >= 50, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'gems-1', name: 'Gem Miner', description: 'Collect 1,000 gems', unlocked: false, checkCondition: (state: GameState) => state.gems >= 1000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'gems-2', name: 'Gem Magnate', description: 'Collect 10,000 gems', unlocked: false, checkCondition: (state: GameState) => state.gems >= 10000, rewards: { type: 'portrait', value: 'love', image: PortraitIcon9 } }, // Stellar Supporter: love.png
    { id: 'completion-1', name: 'Cosmic Completionist', description: 'Unlock 75% of all achievements', unlocked: false, checkCondition: (state: GameState) => state.achievements.filter(a => a.unlocked).length / state.achievements.length >= 0.75, rewards: { type: 'title', value: 'celestial_sovereign', image: 'Celestial Sovereign' } }, // Legendary
  ];
};
