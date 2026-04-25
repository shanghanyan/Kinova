/* eslint-disable no-console */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url === 'your_url_here' || key === 'your_key_here') {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to run seed script.');
  process.exit(1);
}

const supabase = createClient(url, key);

const DEMO_PROFILE = {
  username: 'jamie_arena',
  display_name: 'Jamie',
  character_id: 'spark',
  world_id: 'neon_arcade',
  level: 6,
  xp: 5800,
  current_streak: 4,
  fitness_experience: 'tried_before',
  primary_goal: 'feel_better',
  why_starting: 'Doctor said I need to move more and I want more energy',
  biggest_fear: 'Looking stupid and not knowing what to do',
  available_equipment: ['bodyweight', 'resistance_bands'],
  days_per_week: 3,
  session_length: '20min',
};

const LEADERBOARD_SEED = [
  { username: 'alex_forge', character_id: 'pixel', level: 12, xp_this_week: 2840, rank: 1 },
  { username: 'fitness_nova', character_id: 'nova', level: 9, xp_this_week: 2210, rank: 2 },
  { username: 'zen_master_k', character_id: 'zen', level: 8, xp_this_week: 1990, rank: 3 },
  { username: 'jamie_arena', character_id: 'spark', level: 6, xp_this_week: 1080, rank: 14 },
];

async function run() {
  const userId = crypto.randomUUID();

  await supabase.from('profiles').upsert({ id: userId, ...DEMO_PROFILE });

  for (let i = 0; i < 12; i += 1) {
    const xpEarned = i < 4 ? 120 + i * 20 : i < 8 ? 220 + (i - 4) * 30 : 320 + (i - 8) * 40;
    const avgForm = i < 4 ? 52 + i * 3 : i < 8 ? 65 + (i - 4) * 3 : 75 + (i - 8) * 3;
    await supabase.from('sessions').insert({
      user_id: userId,
      zone: i % 3 === 0 ? 'grid' : 'forge',
      xp_earned: xpEarned,
      avg_form_score: avgForm,
      total_reps: 20 + i * 4,
      session_summary: `Session ${i + 1}: progression tracked`,
    });
  }

  await supabase.from('leaderboard_weekly').upsert(
    LEADERBOARD_SEED.map((u) => ({
      user_id: crypto.randomUUID(),
      username: u.username,
      display_name: u.username,
      character_id: u.character_id,
      level: u.level,
      xp_this_week: u.xp_this_week,
      rank: u.rank,
      sessions_this_week: Math.max(1, Math.round(u.rank / 2)),
    }))
  );

  console.log('Demo data seeded.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
