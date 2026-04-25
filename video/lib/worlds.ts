export interface World {
  id: string;
  name: string;
  emoji: string;
  unlockLevel: number;
  forgeColor: string;
  gridColor: string;
  bgClass: string;
  description: string;
}

export const WORLDS: World[] = [
  {
    id: 'pixel_park', name: 'Pixel Park', emoji: '🌳', unlockLevel: 1,
    forgeColor: '#4ade80', gridColor: '#86efac', bgClass: 'world-pixel-park',
    description: 'A cozy retro park where every workout plants a new tree.'
  },
  {
    id: 'neon_arcade', name: 'Neon Arcade', emoji: '🕹️', unlockLevel: 1,
    forgeColor: '#38bdf8', gridColor: '#f472b6', bgClass: 'world-neon-arcade',
    description: 'An 80s arcade that lights up brighter the harder you work.'
  },
  { id: 'crystal_cavern', name: 'Crystal Cavern', emoji: '💎', unlockLevel: 5, forgeColor: '#a78bfa', gridColor: '#c084fc', bgClass: 'world-crystal-cavern', description: 'A glowing underground cave where crystals pulse with your heartbeat.' },
  { id: 'sky_temple', name: 'Sky Temple', emoji: '⛩️', unlockLevel: 10, forgeColor: '#fb923c', gridColor: '#fbbf24', bgClass: 'world-sky-temple', description: 'Ancient ruins floating among clouds. Every level feels earned here.' },
  { id: 'cyber_city', name: 'Cyber City', emoji: '🌆', unlockLevel: 15, forgeColor: '#22d3ee', gridColor: '#f0abfc', bgClass: 'world-cyber-city', description: 'Rain-soaked streets below. Holograms above. You own this city.' },
  { id: 'cosmic_void', name: 'Cosmic Void', emoji: '🌌', unlockLevel: 20, forgeColor: '#818cf8', gridColor: '#34d399', bgClass: 'world-cosmic-void', description: 'Beyond the stars. For those who have become legend.' },
];
