'use client';

import { useState } from 'react';
import { calculateLevel } from '@/lib/xp';

export function useXP(initialXP = 0) {
  const [xp, setXP] = useState(initialXP);
  const [lastGain, setLastGain] = useState(0);

  function award(amount: number) {
    setXP((prev) => prev + amount);
    setLastGain(amount);
  }

  return { xp, level: calculateLevel(xp), award, lastGain };
}
