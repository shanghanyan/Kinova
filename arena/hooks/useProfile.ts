'use client';

import { useMemo, useState } from 'react';

export function useProfile() {
  const [profile, setProfile] = useState({
    display_name: 'Jamie',
    character_id: 'spark',
    world_id: 'neon_arcade',
    level: 6,
    xp: 5800,
    current_streak: 4,
  });

  const greeting = useMemo(() => {
    if (profile.current_streak >= 3) return `${profile.current_streak}-day streak! You are doing something REAL.`;
    return 'Welcome back! Ready to keep going?';
  }, [profile.current_streak]);

  return { profile, setProfile, greeting };
}
