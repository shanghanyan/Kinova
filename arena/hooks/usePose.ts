'use client';

import { useEffect, useState } from 'react';
import { getPoseLandmarker } from '@/lib/mediapipe/setup';

interface UsePoseResult {
  /** True once the landmarker singleton is loaded and ready to use. */
  ready: boolean;
  /** Non-null if the landmarker failed to load. */
  error: string | null;
}

/**
 * Preloads the MediaPipe PoseLandmarker singleton.
 *
 * Call this at the top of a session page so the model is warm
 * by the time the camera component mounts. The camera components
 * (PoseCamera, DanceCamera) call getPoseLandmarker() themselves,
 * which will resolve instantly once the singleton is cached here.
 *
 * @param enabled - Pass false to skip loading (e.g. user has opted out).
 */
export function usePose(enabled: boolean): UsePoseResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;

    getPoseLandmarker()
      .then(() => {
        if (mounted) {
          setReady(true);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setReady(false);
          setError(
            err instanceof Error
              ? err.message
              : 'Pose model failed to load. Check your network connection.'
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { ready, error };
}