'use client';

import { useState } from 'react';

export function useSession() {
  const [zone, setZone] = useState<'forge' | 'grid'>('forge');
  const [startedAt] = useState(() => new Date().toISOString());
  return { zone, setZone, startedAt };
}
