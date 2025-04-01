import { Achievement, GameState } from '@/context/GameContext';
import GemIcon from '@/assets/images/icons/gems1.png';
import PortraitIcon2 from '@/assets/images/portraits/2.png'; // nebula_voyager
import PortraitIcon3 from '@/assets/images/portraits/3.png'; // astral_navigator
import PortraitIcon4 from '@/assets/images/portraits/4.png'; // stellar_seeker
import PortraitIcon5 from '@/assets/images/portraits/5.png'; // eclipse_warden
import PortraitIcon6 from '@/assets/images/portraits/normalMax.png'; // galactic_guardian
import PortraitIcon7 from '@/assets/images/portraits/specialMax.png'; // singularity_lord
import PortraitIcon8 from '@/assets/images/portraits/uniqueNormal.png'; // cosmic_overlord
import PortraitIcon9 from '@/assets/images/portraits/love.png'; // love (Stellar Supporter)

export const createAchievements = (): Achievement[] => {
  return [
    // General Achievements
    { id: 'new', name: 'Getting Started', description: 'Reach level 10', unlocked: false, checkCondition: (state: GameState) => state.playerData.level >= 10, rewards: { type: 'portrait', value: 'nebula_voyager', image: PortraitIcon2 } },
    { id: 'prestige-1', name: 'Fresh Start', description: 'Prestige for the first time', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 1, rewards: { type: 'title', value: 'space_rookie', image: 'Skipper' } },

    // Clicking Achievements
    { id: 'clicks-1', name: 'Mining Apprentice', description: 'Tap 100 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 100, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'clicks-2', name: 'Mining Enthusiast', description: 'Tap 1,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 1000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'clicks-3', name: 'Mining Expert', description: 'Tap 10,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 10000, rewards: { type: 'portrait', value: 'astral_navigator', image: PortraitIcon3 } },
    { id: 'clicks-4', name: 'Mining Master', description: 'Tap 100,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 100000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'clicks-5', name: 'Mining Legend', description: 'Tap 1,000,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 1000000, rewards: { type: 'portrait', value: 'stellar_seeker', image: PortraitIcon4 } },
    { id: 'clicks-6', name: 'Tap Titan', description: 'Tap 10,000,000 times', unlocked: false, checkCondition: (state: GameState) => state.totalClicks >= 10000000, rewards: { type: 'gems', value: 30, image: GemIcon } },

    // Income Achievements
    { id: 'income-1', name: 'First Profit', description: 'Earn 1,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'income-2', name: 'Rising Business', description: 'Earn 1,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'income-3', name: 'Mining Corporation', description: 'Earn 1,000,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'income-4', name: 'Galactic Enterprise', description: 'Earn 1,000,000,000,000 coins', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1000000000000, rewards: { type: 'portrait', value: 'eclipse_warden', image: PortraitIcon5 } },
    { id: 'income-5', name: 'Universal Conglomerate', description: 'Earn 1 quadrillion coins (1e15)', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1e15, rewards: { type: 'gems', value: 30, image: GemIcon } },
    { id: 'income-6', name: 'Cosmic Tycoon', description: 'Earn 1 quintillion coins (1e18)', unlocked: false, checkCondition: (state: GameState) => state.totalEarned >= 1e18, rewards: { type: 'title', value: 'quantum_miner', image: 'Prodigy' } },

    // Upgrade Achievements
    { id: 'upgrades-1', name: 'Building Elements', description: 'Purchase 10 element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length >= 10, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'upgrades-2', name: 'Elemental Explorer', description: 'Purchase 25 element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length >= 25, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'upgrades-3', name: 'Elemental Mastery', description: 'Purchase all element upgrades', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.category === 'element' && u.level > 0).length === state.upgrades.filter(u => u.category === 'element').length && state.upgrades.filter(u => u.category === 'element').length > 0, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'level-1', name: 'Enhancement Beginner', description: 'Get any upgrade to level 50', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 50), rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'level-2', name: 'Enhancement Pro', description: 'Get any upgrade to level 100', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 100), rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'level-3', name: 'Enhancement Master', description: 'Get any upgrade to level 500', unlocked: false, checkCondition: (state: GameState) => state.upgrades.some(u => u.level >= 500), rewards: { type: 'gems', value: 25, image: GemIcon } },
    { id: 'upgrades-4', name: 'Upgrade Overlord', description: 'Get 5 upgrades to level 1000', unlocked: false, checkCondition: (state: GameState) => state.upgrades.filter(u => u.level >= 1000).length >= 5, rewards: { type: 'title', value: 'asteroid_hunter', image: 'Prodigy' } },

    // Prestige Achievements
    { id: 'prestige-2', name: 'Cycle of Rebirth', description: 'Prestige 5 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 5, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'prestige-3', name: 'Perpetual Renewal', description: 'Prestige 10 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 10, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'prestige-4', name: 'Master of Reincarnation', description: 'Prestige 25 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 25, rewards: { type: 'title', value: 'nebula_master', image: 'Infinite Tribute' } },
    { id: 'prestige-5', name: 'Eternal Cycle', description: 'Prestige 50 times', unlocked: false, checkCondition: (state: GameState) => state.prestigeCount >= 50, rewards: { type: 'title', value: 'void_emperor', image: 'Reincarnated' } },

    // Passive Income Achievements
    { id: 'passive-1', name: 'Automation Beginner', description: 'Reach 1,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'passive-2', name: 'Automation Expert', description: 'Reach 1,000,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000, rewards: { type: 'gems', value: 15, image: GemIcon } }, // Fixed condition to use coinsPerSecond
    { id: 'passive-3', name: 'Automation Master', description: 'Reach 1,000,000,000 coins per second', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'passive-4', name: 'Passive Emperor', description: 'Reach 1 trillion coins per second (1e12)', unlocked: false, checkCondition: (state: GameState) => state.coinsPerSecond >= 1e12, rewards: { type: 'title', value: 'essence_collector', image: 'Starcarver' } },

    // Collection Achievements
    { id: 'collection-1', name: 'Artifact Collector', description: 'Own 5 artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= 5, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'collection-2', name: 'Rare Collector', description: 'Own all artifacts', unlocked: false, checkCondition: (state: GameState) => state.ownedArtifacts.length >= state.artifacts.length, rewards: { type: 'gems', value: 25, image: GemIcon } },
    { id: 'abilities-1', name: 'Tech Pioneer', description: 'Unlock 5 abilities', unlocked: false, checkCondition: (state: GameState) => state.abilities.filter(a => a.unlocked).length >= 5, rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'abilities-2', name: 'Tech Visionary', description: 'Unlock all abilities', unlocked: false, checkCondition: (state: GameState) => state.abilities.filter(a => a.unlocked).length === state.abilities.length && state.abilities.length > 0, rewards: { type: 'title', value: 'stellar_commander', image: 'Celestial Locksmith' } },

    // World-Specific Achievements (Updated for 7 Worlds)
    // World 2: Stellar Forge
    { id: 'world2-1', name: 'Forge Initiate', description: 'Reach 50% progress in Stellar Forge', unlocked: false, checkCondition: (state: GameState) => state.worlds[1].upgradeProgress >= 50, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'world2-2', name: 'Metal Magnate', description: 'Max all upgrades in Stellar Forge', unlocked: false, checkCondition: (state: GameState) => state.worlds[1].upgradeProgress === 100, rewards: { type: 'gems', value: 25, image: GemIcon } },

    // World 3: Verdant Orbit (was World 4)
    { id: 'world3-1', name: 'Green Harvester', description: 'Earn 1 billion coins in Verdant Orbit', unlocked: false, checkCondition: (state: GameState) => state.currentWorld === 3 && state.totalEarned >= 1e9, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'world3-2', name: 'Orbital Overlord', description: 'Max all upgrades in Verdant Orbit', unlocked: false, checkCondition: (state: GameState) => state.worlds[2].upgradeProgress === 100, rewards: { type: 'portrait', value: 'galactic_guardian', image: PortraitIcon6 } },

    // World 4: Ethereal Void (was World 6)
    { id: 'world4-1', name: 'Void Seeker', description: 'Reach 1 trillion CPS in Ethereal Void', unlocked: false, checkCondition: (state: GameState) => state.currentWorld === 4 && state.coinsPerSecond >= 1e12, rewards: { type: 'gems', value: 30, image: GemIcon } },
    { id: 'world4-2', name: 'Energy Emperor', description: 'Max all upgrades in Ethereal Void', unlocked: false, checkCondition: (state: GameState) => state.worlds[3].upgradeProgress === 100, rewards: { type: 'gems', value: 40, image: GemIcon } },

    // World 5: Quantum Drift (was World 7)
    { id: 'world5-1', name: 'Quantum Conqueror', description: 'Earn 1 quintillion coins in Quantum Drift', unlocked: false, checkCondition: (state: GameState) => state.currentWorld === 5 && state.totalEarned >= 1e18, rewards: { type: 'gems', value: 35, image: GemIcon } },
    { id: 'world5-2', name: 'Dimensional Master', description: 'Max all upgrades in Quantum Drift', unlocked: false, checkCondition: (state: GameState) => state.worlds[4].upgradeProgress === 100, rewards: { type: 'title', value: 'galactic_pioneer', image: 'Quantum Dredger' } },

    // World 6: Aqua Nebula (was World 8)
    { id: 'world6-1', name: 'Tidal Tycoon', description: 'Collect 100,000 essence in Aqua Nebula', unlocked: false, checkCondition: (state: GameState) => state.currentWorld === 6 && state.totalEssence >= 100000, rewards: { type: 'gems', value: 40, image: GemIcon } },
    { id: 'world6-2', name: 'Nebula Navigator', description: 'Max all upgrades in Aqua Nebula', unlocked: false, checkCondition: (state: GameState) => state.worlds[5].upgradeProgress === 100, rewards: { type: 'title', value: 'cosmic_explorer', image: 'Maelstrom' } },

    // World 7: Cosmic Apex (was World 9)
    { id: 'world7-1', name: 'Apex Ascendant', description: 'Reach 1 sextillion CPS in Cosmic Apex', unlocked: false, checkCondition: (state: GameState) => state.currentWorld === 7 && state.coinsPerSecond >= 1e21, rewards: { type: 'gems', value: 50, image: GemIcon } },
    { id: 'world7-2', name: 'Cosmic Champion', description: 'Max all upgrades in Cosmic Apex', unlocked: false, checkCondition: (state: GameState) => state.worlds[6].upgradeProgress === 100, rewards: { type: 'portrait', value: 'singularity_lord', image: PortraitIcon7 } },

    // Multi-World Achievements
    { id: 'multiworld-1', name: 'World Wanderer', description: 'Unlock 5 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.filter(w => !w.locked).length >= 5, rewards: { type: 'gems', value: 25, image: GemIcon } },
    { id: 'multiworld-2', name: 'Galactic Trailblazer', description: 'Unlock all 7 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.every(w => !w.locked), rewards: { type: 'gems', value: 40, image: GemIcon } },
    { id: 'multiworld-3', name: 'Bronze Baron', description: 'Earn bronze medals in 5 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.every(w => !w.locked), rewards: { type: 'gems', value: 30, image: GemIcon } },
    { id: 'multiworld-4', name: 'Silver Sovereign', description: 'Earn silver medals in all 7 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.every(w => !w.locked), rewards: { type: 'gems', value: 10, image: GemIcon } },
    { id: 'multiworld-5', name: 'Golden God', description: 'Earn gold medals in all 7 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.every(w => !w.locked), rewards: { type: 'portrait', value: 'cosmic_overlord', image: PortraitIcon8 } },

    // Essence & Resource Achievements
    { id: 'essence-1', name: 'Essence Hoarder', description: 'Collect 10,000 essence', unlocked: false, checkCondition: (state: GameState) => state.totalEssence >= 10000, rewards: { type: 'gems', value: 20, image: GemIcon } },
    { id: 'essence-2', name: 'Essence Lord', description: 'Collect 1,000,000 essence', unlocked: false, checkCondition: (state: GameState) => state.totalEssence >= 1000000, rewards: { type: 'title', value: 'celestial_sovereign', image: 'Essence Paragon' } },
    { id: 'gems-1', name: 'Gem Miner', description: 'Collect 1,000 gems', unlocked: false, checkCondition: (state: GameState) => state.gems >= 1000, rewards: { type: 'gems', value: 15, image: GemIcon } },
    { id: 'gems-3', name: 'Gem Lover', description: 'Collect 5,000 gems', unlocked: false, checkCondition: (state: GameState) => state.gems >= 5000, rewards: { type: 'title', value: 'gem_supporter', image: 'Cosmic Sugar Daddy' } },
    { id: 'gems-2', name: 'Gem Magnate', description: 'Collect 10,000 gems', unlocked: false, checkCondition: (state: GameState) => state.gems >= 10000, rewards: { type: 'portrait', value: 'love', image: PortraitIcon9 } },

    // Endgame Mastery Achievements
    { id: 'mastery-1', name: 'Skill Savant', description: 'Earn 500 skill points', unlocked: false, checkCondition: (state: GameState) => state.skillPoints >= 500, rewards: { type: 'gems', value: 30, image: GemIcon } },
    { id: 'mastery-2', name: 'Cosmic Completionist', description: 'Unlock 90% of all achievements', unlocked: false, checkCondition: (state: GameState) => state.achievements.filter(a => a.unlocked).length / state.achievements.length >= 0.9, rewards: { type: 'title', value: 'cosmic_deity', image: 'Supreme Leader' } },
    { id: 'mastery-3', name: 'Universal Master', description: 'Max all upgrades across 5 worlds', unlocked: false, checkCondition: (state: GameState) => state.worlds.filter(w => w.upgradeProgress === 100).length >= 5, rewards: { type: 'gems', value: 50, image: GemIcon } },
  ];
};