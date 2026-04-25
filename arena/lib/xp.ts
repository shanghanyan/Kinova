export const XP_VALUES = {
  rep_any: 10,
  rep_perfect: 20,
  set_complete: 30,
  set_perfect: 80,
  session_complete: 100,
  personal_best_form: 150,
  first_time_exercise: 50,
  move_good: 15,
  move_great: 25,
  move_perfect: 40,
  combo_x5: 50,
  combo_x10: 100,
  song_complete: 80,
  session_complete_grid: 100,
  day_3_streak: 50,
  day_7_streak: 200,
  day_14_streak: 500,
  daily_mission: 200,
  weekly_mission: 500,
};

export const LEVEL_THRESHOLDS = [0,300,700,1300,2200,3500,5200,7500,10500,14500,20000,27000,36000,47000,60000,75000,92000,111000,132000,155000];

export const LEVEL_TITLES = [
  'Newcomer', 'Rookie', 'Contender', 'Fighter', 'Warrior', 'Champion', 'Elite', 'Master', 'Grandmaster', 'Legend',
  'Mythic', 'Ascendant', 'Transcendent', 'Immortal', 'Eternal', 'Cosmic', 'Infinite', 'Absolute', 'Beyond', 'THE ARENA'
];

export const LEVEL_UNLOCKS: Record<number, { type: string; id: string; name: string }[]> = {
  3: [{ type: 'character', id: 'pixel', name: 'PIXEL the AI bot' }],
  5: [{ type: 'world', id: 'crystal_cavern', name: 'Crystal Cavern 💎' }],
  10: [{ type: 'world', id: 'sky_temple', name: 'Sky Temple ⛩️' }],
  15: [{ type: 'world', id: 'cyber_city', name: 'Cyber City 🌆' }],
  20: [{ type: 'world', id: 'cosmic_void', name: 'Cosmic Void 🌌' }],
};

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(20, level);
}

export function xpToNextLevel(xp: number): { needed: number; current: number; percent: number } {
  const level = calculateLevel(xp);
  if (level >= 20) return { needed: 0, current: 0, percent: 100 };
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[level];
  const needed = nextLevelXP - currentLevelXP;
  const current = xp - currentLevelXP;
  return { needed, current, percent: Math.floor((current / needed) * 100) };
}
