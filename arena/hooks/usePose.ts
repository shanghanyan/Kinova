'use client';

import { useEffect, useState } from 'react';
import { getPoseLandmarker } from '@/lib/mediapipe/setup';

export function usePose(enabled: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    getPoseLandmarker().then(() => {
      if (mounted) setReady(true);
    }).catch(() => {
      if (mounted) setReady(false);
    });
    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { ready };
}
